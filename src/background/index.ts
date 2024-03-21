interface IssueProps {
  id: string;
  title: string;
}

// A global promise to avoid concurrency issues
let creating: Promise<void> | null;

chrome.runtime.onInstalled.addListener( async() => {
  console.log("Background -> onInstalled");
});

const setupOffscreenDocument = async (path :string) => {
  console.log("Funtion of `setupOffscreenDocument` is called.");
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      justification: 'reason for needing the document',
    });
    await creating;
    creating = null;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`Background -> onMessage -> message = ${message}, sender = ${sender}`);
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (message.event == "grab-data") {
      console.log("Background -> onMessage -> event = grab-data");
      chrome.scripting.executeScript({
      target: { tabId: tabs[0].id || 0, frameIds: [0]},
        func: getDataFromCurrentWebPage
      })
      .then((frameResult) => {
        console.log('Background -> onMessage -> grab-data -> frameResult: ', frameResult);
        sendResponse({ data: frameResult[0].result });
      });
    } else if (message.event == "play-audio") {
      console.log(`Background -> onMessage -> event = play-audio, isPlay = ${message.isPlay}`);
      if (message.isPlay) {
        chrome.runtime.sendMessage({ action: "pause" });
      } else {
        await setupOffscreenDocument("offscreen.html");
        chrome.runtime.sendMessage({ action: "play" });
      }
    }
  });
  return true;
});

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