import { format, transports, createLogger } from "winston";
const { combine, colorize, simple } = format;

const logger = createLogger({
  level: "info",
  exitOnError: false,
  format: format.json(),
  transports: [
    new transports.Console({
      format: combine(colorize(), simple()),
      level: "info",
    }),
  ],
});

export default logger;
