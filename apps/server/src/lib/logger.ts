import logger, { format, transports } from "winston";
import { NODE_ENV } from "../config";
const { combine, timestamp, json, colorize, simple } = format;

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

export default logger;
