import logger, { format, transports, createLogger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
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

const transport: DailyRotateFile = new DailyRotateFile({
  filename: `${process.cwd()}/logs/access-%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  format: combine(timestamp(), json()),
  level: "info",
});

const ddTransport = new transports.Http({
  host: "http-intake.logs.datadoghq.com",
  path: `/api/v2/logs?dd-api-key=${DD_API_KEY}&ddsource=nodejs&service=${SERVICE_NAME}`,
  format: format.json(),
  level: "info",
  ssl: true,
});

if (NODE_ENV === "production") {
  logger.add(ddTransport);
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
    transport,
    ddTransport,
    new transports.File({
      filename: `${process.cwd()}/logs/access.log`,
      level: "info",
      format: combine(timestamp(), json()),
    }),
  ],
});

export default logger;
