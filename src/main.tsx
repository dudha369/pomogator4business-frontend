import ReactDOM from "react-dom/client";

import { App } from "./app/App";
import { initTelegramSdk } from "./shared/telegram/init";
import "./styles/index.css";

initTelegramSdk();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(<App />);
