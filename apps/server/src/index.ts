import express from "express";
import path from "path";
import logger from "./lib/logger";
import { PORT, NODE_ENV } from "./config";
import app from "./app";
import { scheduleJobs } from "./crons";

(async function () {
  scheduleJobs();

  if (NODE_ENV === "prod" || NODE_ENV === "staging") {
    const APP_OUT_DIRECTORY = path.join(__dirname, "..", "..", "client", "out");
    const APP_INDEX = path.join(APP_OUT_DIRECTORY, "index.html");
    app.use(express.static(APP_OUT_DIRECTORY));
    app.get("*", (_, res) => {
      res.sendFile(APP_INDEX);
    });
  }

  app.listen(PORT, () => {
    logger.info(`Listening on port: ${PORT}`);
  });
})();
