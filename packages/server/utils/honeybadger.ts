import { NODE_ENV, HONEYBADGER_API_KEY } from "../config";

const Honeybadger = require("honeybadger").configure({
  apiKey: HONEYBADGER_API_KEY,
  environment: NODE_ENV,
  developmentEnvironments: ["dev", "development"],
});

export default Honeybadger;
