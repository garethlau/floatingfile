const { NODE_ENV, HONEYBADGER_API_KEY } = require("../config");

const Honeybadger = require("honeybadger").configure({
  apiKey: HONEYBADGER_API_KEY,
  environment: NODE_ENV,
  developmentEnvironments: ["dev", "development"],
});

module.exports = Honeybadger;
