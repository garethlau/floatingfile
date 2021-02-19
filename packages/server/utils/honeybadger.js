const { NODE_ENV } = require("../config");

const Honeybadger = require("honeybadger").configure({
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: NODE_ENV,
  developmentEnvironments: ["dev", "development"],
});

module.exports = Honeybadger;
