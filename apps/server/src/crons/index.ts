import cron from "node-cron";
import { copyLogs } from "./copy-logs";
import { expireSpaces } from "./expire-spaces";
import { getOsStats } from "./get-os-stats";

export function scheduleJobs() {
  cron.schedule("* * * * *", () => {
    expireSpaces();
  });

  cron.schedule("* * * * *", () => {
    getOsStats();
  });

  cron.schedule("* * * * *", () => {
    copyLogs();
  });
}
