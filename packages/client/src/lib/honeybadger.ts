import Honeybadger from "@honeybadger-io/js";

Honeybadger.configure({
  apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY || "",
  environment: process.env.REACT_APP_ENVIRONMENT,
  disabled: process.env.REACT_APP_ENVIRONMENT === "development",
  breadcrumbsEnabled: {
    dom: true,
    network: true,
    navigation: true,
    console: false,
  },
});

export default Honeybadger;
