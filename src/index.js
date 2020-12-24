import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

function noop() {}

console.log("%c floatingfile", "font-size: 60px; font-family: 'DM Sans', sans-serif;");
console.log("%c Built by Gareth Lau (https://garethlau.me)", "font-family: 'DM Ssans', sans-serif;");

if (process.env.NODE_ENV === "production") {
	console.log = noop;
	console.warn = noop;
	console.error = noop;
}

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
