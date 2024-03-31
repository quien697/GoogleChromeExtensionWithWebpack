import Content from "./Content";
import UserInfo from "./UserInfo";
import { createRoot } from "react-dom/client"
import { User } from "firebase/auth";
import { MessageAction, ContentMessageAction } from "../enum";

const createPopupComponents = () => {
  let mainElement: HTMLDivElement = document.createElement("div");
  mainElement.id = "popup-windows";
  document.body.appendChild(mainElement);
  return createRoot(mainElement);
}

chrome.runtime.onMessage.addListener(async (message) => {
  console.log("ContentScript -> Message:", message);

  try {
    switch (message.action) {
      case ContentMessageAction.GetDataFromJira:
        console.log("ContentScript -> GetDataFromJira -> issues:", message.issues);
        createPopupComponents().render(<Content issues={message.issues} />);
        break;
      case ContentMessageAction.GetUserInfo:
        console.log("ContentScript -> GetUserInfo");

        const user: User = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: MessageAction.GetAuthenticationStatus
          }, (response) => {
            console.log("response");
            if (chrome.runtime.lastError) {
              console.log("reject");
              reject(chrome.runtime.lastError);
            } else {
              console.log("resolve");
              resolve(response);
            }
          });
        });

        createPopupComponents().render(<UserInfo user={user} />)
        break;
    }
  } catch (error) {
    console.log("ContentScript -> error:", error);
  }
});