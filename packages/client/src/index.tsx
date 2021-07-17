import ReactDOM from "react-dom";
import App from "./App";
import ErrorBoundary from "@honeybadger-io/react";
import Honeybadger from "./lib/honeybadger";

ReactDOM.render(
  <ErrorBoundary honeybadger={Honeybadger}>
    <App />
  </ErrorBoundary>,
  document.getElementById("root")
);
