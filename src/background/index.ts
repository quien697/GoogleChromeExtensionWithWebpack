interface Issue {
  id: string;
  title: string;
}

interface DataProps {
  event: string;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background -> onInstalled");
});

chrome.action.onClicked.addListener((tab) => {
  console.log("Background -> onClicked -> tab: ", tab);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background -> onMessage -> request', request);
  console.log('Background -> onMessage -> sender', sender);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (request.event == "grab-data") {
      chrome.scripting.executeScript({
      target: { tabId: tabs[0].id || 0, frameIds: [0]},
        func: getDataFromCurrentWebPage
      })
      .then((frameResult) => {
        console.log('Background -> onMessage -> then -> frameResult: ', frameResult);
        sendResponse({ data: frameResult[0].result });
      });
    }
  });
  return true;
});

const getDataFromCurrentWebPage = () => {
  const issues: Issue[] = [];
  const boardElements = document.getElementsByClassName("j176hd-1");
  // Get the To Do category element.
  let todosElement;
  if (boardElements) {
    for (let i = 0; i < boardElements.length; i++) {
      const element = boardElements[i];
      const titleElement = element.getElementsByClassName("j6nxay-1")[0];
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
        const idElement = items[i].getElementsByClassName("_1bto1l2s");
        const titleElement = items[i].getElementsByClassName("_slp31hna");
        const id = idElement[0].textContent?.trim()!;
        const title = titleElement[0].textContent?.trim()!;
        issues.push({ id, title });
      }
      console.log('Background -> onMessage -> scripting -> issues', issues);
    }
  }
  return issues;
}