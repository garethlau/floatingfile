#!/usr/bin/env node
import yargs from "yargs";
import path from "path";
import { hideBin } from "yargs/helpers";
import chalk from "chalk";
import { init } from "./lib/storage";

(async () => {
  process.stdout.write(chalk.blue.bold(">>> floatingfile") + "\n");
  init();
  yargs(hideBin(process.argv))
    // Use the commands directory to scaffold.
    .commandDir(path.join(__dirname, "commands"))
    .demandCommand()
    // Enable strict mode.
    .strict()
    // Useful aliases.
    .alias({ h: "help", v: "version", c: "code" }).argv;
})();
