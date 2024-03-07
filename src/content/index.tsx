import Content from "./Content";
import { createRoot } from "react-dom/client"

chrome.runtime.onMessage.addListener(
  function(msg) {
    const mainElement = document.createElement("div");
    mainElement.id = "popup-windows";
    document.body.appendChild(mainElement);

    const root = createRoot(mainElement);
    root.render(<Content msg={msg} />)
  }
);