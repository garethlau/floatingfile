import { format, transports, createLogger } from "winston";
import { DD_API_KEY, NODE_ENV } from "../config";
const { combine, timestamp, json, colorize, simple } = format;

const SERVICE_NAME = "server";
const ddEnv = NODE_ENV === "prod" ? "production" : "staging";

const logger = createLogger({
  level: "info",
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.Http({
      host: "http-intake.logs.datadoghq.com",
      path: `/api/v2/logs?dd-api-key=${DD_API_KEY}&ddsource=nodejs&service=${SERVICE_NAME}&ddtags=env:${ddEnv}`,
      format: format.json(),
      level: "info",
      ssl: true,
    }),
    new transports.File({
      filename: `${process.cwd()}/logs/error.log`,
      level: "error",
      format: combine(timestamp(), json()),
    }),

    new transports.Console({
      format: combine(colorize(), simple()),
      level: "info",
    }),
  ],
});

export default logger;
