import Content from "./Content";
import { createRoot } from "react-dom/client"

chrome.runtime.onMessage.addListener(({ issues }) => {
  let mainElement: HTMLDivElement = document.createElement("div");
  mainElement.id = "popup-windows";
  document.body.appendChild(mainElement);
  const root = createRoot(mainElement);
  root.render(<Content issues={issues} />)
});