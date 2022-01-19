import Honeybadger from "@honeybadger-io/js";

Honeybadger.configure({
  apiKey: process.env.REACT_APP_HONEYBADGER_API_KEY,
  environment: process.env.REACT_APP_ENVIRONMENT,
  reportData: process.env.REACT_APP_ENVIRONMENT === "production",
  breadcrumbsEnabled: {
    console: false,
  },
});

export default Honeybadger;
