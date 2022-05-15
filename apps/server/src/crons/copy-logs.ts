import fs from "fs";
import path from "path";
const srcDir = path.join(process.cwd(), "logs");
const destDir = path.join(process.cwd(), "..", "landing", "content", "logs");

export function copyLogs() {
  const files = ["access.log", "stats.log"];

  files.forEach((fileName) => {
    copyFile(fileName);
  });
}

function copyFile(name: string) {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);
  fs.copyFileSync(src, dest);
}
