import { signInWithCredential, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;
let offscreenPath: string = "offscreen.html";

interface IssueProps {
  id: string;
  title: string;
}

const getDataFromCurrentWebPage = () => {
  const issues: IssueProps[] = [];
  const boardElements = document.getElementsByClassName("j176hd-1");
  // Get the To Do category element.
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
    // Get each items element.
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

const hasDocument = async () => {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(offscreenPath);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });
  return existingContexts.length > 0;
}

const closeOffscreenDocument = async () => {
  if (!await hasDocument()) {
    return;
  }
  await chrome.offscreen.closeDocument();
}

const setupOffscreenDocument = async () => {
  console.log("Funtion of `setupOffscreenDocument` is called.");
  if (await hasDocument()) {
    return;
  }
  // create offscreen document
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

const signInWithGoogle = () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      console.log("handleLoginWithGoogle -> getAuthToken -> error: ", JSON.stringify(chrome.runtime.lastError));
      return
    }
    console.log('handleLoginWithGoogle -> getAuthToken -> token: ', token);
    const credential = GoogleAuthProvider.credential(null, token);
    signInWithCredential(auth, credential)
      .then(result => {
        console.log('handleLoginWithGoogle -> signInWithCredential -> result: ', result);
      })
      .catch(error => {
        console.log('handleLoginWithGoogle -> signInWithCredential -> error: ', error);
      })
  });
}

const getGitHubAuthUrl = () => {
  let authUrl = 'https://github.com/login/oauth/authorize';
  let clientID = process.env.GITHUB_CLIENT_ID;
  let redirectUri = encodeURIComponent(chrome.identity.getRedirectURL());
  let scope = encodeURIComponent(["user", "user:email"].join(" "));
  let state = crypto.randomUUID();
  chrome.storage.local.set({ key: state });
  return `${authUrl}?client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
}

const exchangeCodeForToken = async (code: string) => {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code
    })
  });
  const data = await response.json();
  return data.access_token;
}

const signinWithGitHub = async () => {
  console.log("handleLoginWithGitHub -> launchWebAuthFlow");
  chrome.identity.launchWebAuthFlow({
    url: getGitHubAuthUrl(),
    interactive: true
  }, async (redirectUrl) => {
    console.log("handleLoginWithGitHub -> launchWebAuthFlow -> redirectUrl: ", redirectUrl);
    if (redirectUrl) {
      const params = new URLSearchParams(new URL(redirectUrl).search);
      const code = params.get('code');
      const state = params.get('state');
      console.log("handleLoginWithGitHub -> launchWebAuthFlow -> code: ", code);
      console.log("handleLoginWithGitHub -> launchWebAuthFlow -> state: ", state);
      chrome.storage.local.get(["key"])
      .then( async (result) => {
        if ((code) && (result.key === state)) {
          const token = await exchangeCodeForToken(code);
          console.log('handleLoginWithGitHub -> exchangeCodeForToken -> token: ', token);
          const credential = GithubAuthProvider.credential(token);
          signInWithCredential(auth, credential)
          .then(result => {
            console.log('handleLoginWithGitHub -> signInWithCredential -> result: ', result);
          })
          .catch(error => {
            console.log('handleLoginWithGitHub -> signInWithCredential -> error: ', error);
          })
        }
      });
    }
  });
}

chrome.runtime.onInstalled.addListener( async() => {
  console.log("Background -> onInstalled");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background -> onMessage");
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (message.event == "grabData") {
      console.log("Background -> onMessage -> event = grab-data");
      chrome.scripting.executeScript({
      target: { tabId: tabs[0].id || 0, frameIds: [0]},
        func: getDataFromCurrentWebPage
      })
      .then((frameResult) => {
        console.log('Background -> onMessage -> grab-data -> frameResult: ', frameResult);
        sendResponse({ data: frameResult[0].result });
      });
    } else if (message.event == "playAudio") {
      console.log(`Background -> onMessage -> event = play-audio, isPlay = ${message.isPlay}`);
      if (message.isPlay) {
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
    } else if (message.event == "signIn") {
      switch (message.type) {
        case "google":
          signInWithGoogle();
          break;
        case "github":
          signinWithGitHub();
          break;
      }
    }
  });
  return true;
});