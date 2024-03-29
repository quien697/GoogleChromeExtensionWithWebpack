import Content from "./Content";
import { createRoot } from "react-dom/client"
import { User } from 'firebase/auth';
import { MessageAction } from "../enum";

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("ContentScript -> Message:", message);
  if(message.issues) {
    try {
      const user: User = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: MessageAction.GetAuthenticationStatus
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      console.log("ContentScript -> User:", user);
      let mainElement: HTMLDivElement = document.createElement("div");
      mainElement.id = "popup-windows";
      document.body.appendChild(mainElement);
      const root = createRoot(mainElement);
      root.render(<Content user={user} issues={message.issues} />)
    } catch (error) {
      console.log("ContentScript -> error:", error);
    }
  }
});