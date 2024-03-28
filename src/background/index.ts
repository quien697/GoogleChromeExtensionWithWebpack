import { signInWithCredential, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { MessageAction, LoginType } from '../enum';

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;
let offscreenPath: string = "offscreen.html";

interface IssueProps {
  id: string;
  title: string;
}

interface GrabDataProps {
  tabId: number;
  sendResponse: any;
}

interface ExchangeCodeForTokenProps {
  url: string;
  headers: HeadersInit;
  body: BodyInit;
}

interface AuthUrlProps {
  url: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  state?: string;
  response_type?: string;
}

const getDataFromCurrentWebPage = () => {
  const issues: IssueProps[] = [];
  const boardElements = document.getElementsByClassName("j176hd-1");
  let todosElement;
  if (boardElements) {
    for (let i = 0; i < boardElements.length; i++) {
      let element = boardElements[i];
      let titleElement = element.getElementsByClassName("j6nxay-1")[0];
      if (titleElement) {
        const title = titleElement.textContent?.trim();
        if (title === "To Do") {
          todosElement = element;
          break;
        }
      }
    }
    const items = todosElement?.getElementsByClassName("yse7za_content");
    if (items) {
      for (let i = 0; i < items!.length; i++) {
        let idElement = items[i].getElementsByClassName("_1bto1l2s");
        let titleElement = items[i].getElementsByClassName("_slp31hna");
        let id = idElement[0].textContent?.trim()!;
        let title = titleElement[0].textContent?.trim()!;
        issues.push({ id, title });
      }
    }
  }
  return issues;
}

const hasOffscreenDocument = async () => {
  const offscreenUrl = chrome.runtime.getURL(offscreenPath);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });
  return existingContexts.length > 0;
}

const closeOffscreenDocument = async () => {
  if (!await hasOffscreenDocument()) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

const setupOffscreenDocument = async () => {
  if (await hasOffscreenDocument()) {
    return;
  }
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: offscreenPath,
      reasons: [
        chrome.offscreen.Reason.AUDIO_PLAYBACK
      ],
      justification: 'reason for needing the document',
    });
    await creating;
    creating = null;
  }
}

const getAuthUrl = (props: AuthUrlProps) => {
  chrome.storage.local.set({ key: props.state });
  return `${props.url}
?client_id=${props.clientId}
&redirect_uri=${props.redirectUri}
${props.scope?`&scope=${props.scope}`:""}
${props.state?`&state=${props.state}`:""}
${props.response_type?`&response_type=code`:""}`;
}

const exchangeCodeForToken = async (props: ExchangeCodeForTokenProps) => {
  const response = await fetch(props.url, {
    method: 'POST',
    headers: props.headers,
    body: props.body
  });
  const data = await response.json();
  return data.access_token;
}

const getTokenFromGithub = async (code: string) => {
  return await exchangeCodeForToken({
    url: "https://github.com/login/oauth/access_token",
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });
}

const getTokenFromSpotify = async (code: string) => {
  const requestBody = new URLSearchParams();
  requestBody.append('grant_type', 'authorization_code');
  requestBody.append('code', code);
  requestBody.append('redirect_uri', chrome.identity.getRedirectURL());
  return await exchangeCodeForToken({
    url: "https://accounts.spotify.com/api/token",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET)}`
    },
    body: requestBody
  });
}

const handleGrabDataFromJira = ({ tabId, sendResponse }: GrabDataProps) => {
  chrome.scripting.executeScript({
    target: { tabId, frameIds: [0]},
      func: getDataFromCurrentWebPage
    })
    .then((frameResult) => {
      console.log('Background -> GrabDataFromJira -> frameResult: ', frameResult);
      sendResponse({ data: frameResult[0].result });
    });
}

const handlePlayAudio = async (isPlay: boolean) => {
  if (isPlay) {
    chrome.runtime.sendMessage({
      target: "offscreen",
      type: "playAudio",
      action: "pause"
    });
  } else {
    await setupOffscreenDocument();
    chrome.runtime.sendMessage({
      target: "offscreen",
      type: "playAudio",
      action: "play"
    });
  }
}

const handleSignInWithGoogle = () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    console.log('handleSignInWithGoogle -> getAuthToken -> token: ', token);
    if (chrome.runtime.lastError || !token) {
      console.log("handleSignInWithGoogle -> getAuthToken -> error: ", JSON.stringify(chrome.runtime.lastError));
      return;
    }
    const credential = GoogleAuthProvider.credential(null, token);
    signInWithCredential(auth, credential)
      .then(result => {
        console.log('handleSignInWithGoogle -> signInWithCredential -> result: ', result);
      })
      .catch(error => {
        console.log('handleSignInWithGoogle -> signInWithCredential -> error: ', error);
      })
  });
}

const handleSigninWithGitHub = async () => {
  const authUrl = getAuthUrl({
    url: "https://github.com/login/oauth/authorize",
    clientId: process.env.GITHUB_CLIENT_ID,
    redirectUri: encodeURIComponent(chrome.identity.getRedirectURL()),
    scope: encodeURIComponent(["user", "user:email"].join(" ")),
    state: crypto.randomUUID()
  });

  chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true
  }, (redirectUrl) => {
    console.log("handleSigninWithGitHub -> launchWebAuthFlow -> redirectUrl: ", redirectUrl);
    if (redirectUrl) {
      const params = new URLSearchParams(new URL(redirectUrl).search);
      const code = params.get('code');
      const state = params.get('state');
      console.log("handleSigninWithGitHub -> launchWebAuthFlow -> code: ", code);
      console.log("handleSigninWithGitHub -> launchWebAuthFlow -> state: ", state);
      chrome.storage.local.get(["key"])
      .then( async (result) => {
        if ((code) && (result.key === state)) {
          const token = await getTokenFromGithub(code);
          console.log('handleSigninWithGitHub -> getTokenFromGithub -> token: ', token);
          const credential = GithubAuthProvider.credential(token);
          signInWithCredential(auth, credential)
          .then(result => {
            console.log('handleSigninWithGitHub -> signInWithCredential -> result: ', result);
          })
          .catch(error => {
            console.log('handleSigninWithGitHub -> signInWithCredential -> error: ', error);
          })
        }
      });
    }
  });
}

const handleSigninWithSpotify = () => {
  const authUrl = getAuthUrl({
    url: "https://accounts.spotify.com/authorize",
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: encodeURIComponent(chrome.identity.getRedirectURL()),
    scope: encodeURIComponent(["user-read-email"].join(" ")),
    state: crypto.randomUUID(),
    response_type: "code"
  });

  chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true
  }, (redirectUrl) => {
    console.log("handleSigninWithSpotify -> launchWebAuthFlow -> redirectUrl: ", redirectUrl);
    if (redirectUrl) {
      const params = new URLSearchParams(new URL(redirectUrl).search);
      const code = params.get('code');
      const state = params.get('state');
      console.log("handleSigninWithSpotify -> launchWebAuthFlow -> code:", code);
      console.log("handleSigninWithSpotify -> launchWebAuthFlow -> state:", state);
      chrome.storage.local.get(["key"])
      .then( async (result) => {
        if ((code) && (result.key === state)) {
          const token = await getTokenFromSpotify(code);
          console.log('handleSigninWithSpotify -> getTokenFromSpotify -> token: ', token);
        }
      });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background -> onInstalled");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    switch (message.action) {
      case MessageAction.GrabDataFromJira:
        console.log("Background -> GrabDataFromJira");
        handleGrabDataFromJira({ tabId: tabs[0].id || 0, sendResponse });
        break;
      case MessageAction.PlayAudio:
        console.log("Background -> PlayAudio");
        handlePlayAudio(message.isPlay);
        break;
      case MessageAction.SignIn:
        console.log("message.loginType:", message.loginType)
        switch (message.loginType) {
          case LoginType.Google:
            handleSignInWithGoogle();
            break;
          case LoginType.GitHub:
            handleSigninWithGitHub();
            break;
          case LoginType.Spotify:
            handleSigninWithSpotify();
            break;
        }
        break;
    }
  });
  return true;
});