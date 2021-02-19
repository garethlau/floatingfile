const logger = require("winston");
const { format, transports } = require("winston");
const { combine, timestamp, json, colorize, simple } = format;
const { NODE_ENV } = require("../config");

logger.add(
  new transports.File({
    filename: "error.log",
    level: "error",
    format: combine(timestamp(), json()),
  })
);

if (NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple()),
      level: "info",
    })
  );
}

module.exports = logger;
