import React from "react";
import ReactDOM from "react-dom/client";
import ReactGA from "react-ga4";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import { ConfigContextProvider } from "config";

import App from "./App";
import "styles/index.scss";
import '@rainbow-me/rainbowkit/styles.css';

// load ga tracking if id available
if (process.env.REACT_APP_GA_TRACKING_ID) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
}

const domRoot: ReactDOM.Root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

console.debug(`App Version: ${process.env.REACT_APP_VERSION}`);

domRoot.render(
  <React.StrictMode>
    <ConfigContextProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </ConfigContextProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
