import Content from "./Content";
import { createRoot } from "react-dom/client"

chrome.runtime.onMessage.addListener((data) => {
  const mainElement = document.createElement("div");
  mainElement.id = "popup-windows";
  document.body.appendChild(mainElement);
  const root = createRoot(mainElement);
  root.render(<Content data={data} />)
});