interface Issue {
  id: string;
  title: string;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background -> onInstalled");
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
        console.log('Background -> onMessage -> grab-data -> frameResult: ', frameResult);
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