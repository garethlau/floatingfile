import Honeybadger from "@honeybadger-io/js";
import { NODE_ENV, HONEYBADGER_API_KEY } from "../config";

Honeybadger.configure({
  apiKey: HONEYBADGER_API_KEY,
  environment: NODE_ENV,
  developmentEnvironments: ["dev", "development"],
});

export default Honeybadger;
