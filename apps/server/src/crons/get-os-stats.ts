import os from "os-utils";

import fs from "fs";

export const getOsStats = async () => {
  os.cpuUsage((cpu) => {
    const mem = os.freememPercentage();
    const timestamp = new Date().toISOString();
    const data = { cpu, mem, timestamp };
    fs.appendFileSync(
      `${process.cwd()}/logs/stats.log`,
      `${JSON.stringify(data)}\n`
    );
  });
};
