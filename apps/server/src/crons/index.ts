import cron from "node-cron";
import { expireSpaces } from "./expire-spaces";

export function scheduleJobs() {
  cron.schedule("* * * * *", () => {
    expireSpaces();
  });
}
