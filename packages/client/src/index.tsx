import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Honeybadger from "honeybadger-js";
import ErrorBoundary from "@honeybadger-io/react";

Honeybadger.configure({
  apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY || "",
  environment: process.env.REACT_APP_ENVIRONMENT,
  disabled: process.env.REACT_APP_ENVIRONMENT === "development",
  breadcrumbsEnabled: true,
});

function noop() {}

console.log(
  "%c floatingfile",
  "font-size: 60px; font-family: 'DM Sans', sans-serif;"
);
console.log(
  "%c Built by Gareth Lau (https://garethlau.me)",
  "font-family: 'DM Sans', sans-serif;"
);

if (process.env.NODE_ENV === "production") {
  console.log = noop;
  console.warn = noop;
  console.error = noop;
}

ReactDOM.render(
  <ErrorBoundary honeybadger={Honeybadger}>
    <App />
  </ErrorBoundary>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
