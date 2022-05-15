import logger, { format, transports, createLogger } from "winston";
import { NODE_ENV } from "../config";
import DailyRotateFile from "winston-daily-rotate-file";
("winston-daily-rotate-file");
import path from "path";
import fs from "fs";

const { combine, timestamp, json, colorize, simple, printf } = format;

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

transport.on("rotate", (oldFilename, newFilename) => {
  const srcDir = path.join(process.cwd(), "logs");
  const destDir = path.join(process.cwd(), "..", "landing", "content", "logs");
  const src = path.join(srcDir, oldFilename);
  const dest = path.join(destDir, newFilename);
  fs.copyFileSync(src, dest);
});

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
  ],
});

export default logger;
