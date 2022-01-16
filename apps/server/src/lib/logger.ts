import logger, { format, transports, createLogger } from "winston";
import { NODE_ENV } from "../config";
const { combine, timestamp, json, colorize, simple, printf } = format;

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

export const accessLogger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        timestamp({ format: "MMM-DD HH:mm:ss" }),
        colorize(),
        printf((info) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
      ),
    }),

    new transports.File({
      filename: "access.log",
      level: "info",
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
