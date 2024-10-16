import React from "react";
import ReactDOM from "react-dom/client";
import "styles/index.scss";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const domRoot: ReactDOM.Root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

console.debug(`App Version: ${process.env.REACT_APP_VERSION}`);

domRoot.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
