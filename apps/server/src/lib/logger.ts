import logger, { format, transports, createLogger } from "winston";
import { NODE_ENV, DD_API_KEY } from "../config";
const { combine, timestamp, json, colorize, simple, printf } = format;

const SERVICE_NAME = "server";

logger.add(
  new transports.File({
    filename: `${process.cwd()}/logs/error.log`,
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

if (NODE_ENV === "production") {
  logger.add(
    new transports.Http({
      host: "http-intake.logs.datadoghq.com",
      path: `/api/v2/logs?dd-api-key=${DD_API_KEY}&ddsource=nodejs&service=${SERVICE_NAME}`,
      format: format.json(),
      level: "info",
      ssl: true,
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
      filename: `${process.cwd()}/logs/access.log`,
      level: "info",
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
