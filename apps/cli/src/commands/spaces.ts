import type { Arguments, CommandBuilder } from "yargs";
import chalk from "chalk";
import { fetchCodes, saveCodes } from "../lib/storage";
import { prompt } from "../lib/readline";

type Options = {
  def: boolean | undefined;
};

export const command: string = "spaces";
export const desc: string = "Get list of recently accessed (and alive) spaces.";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    def: { type: "boolean", description: "interactively set a new default" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { def } = argv;

  const codes = await fetchCodes();
  if (def) {
    // Set new default
    let query = "Which space do you want to set as the default?\n";
    codes.forEach((code, index) => {
      const url = `https://app.floatingfile.space/s/${code}`;
      if (index === 0) {
        query += chalk.green(`(default) ${code} ${url}\n`);
      } else {
        query += `(${index}) ${code} ${url}\n`;
      }
    });

    const input = await prompt(query);
    const selection = parseInt(input.trim(), 10);
    if (isNaN(selection)) {
      process.stdout.write(chalk.red(`Invalid input: ${selection}\n`));
      process.exit();
    }

    if (selection < 1 || selection > codes.length) {
      process.stdout.write(chalk.red(`Out of range: ${selection}\n`));
      process.exit();
    }

    const updatedCodes = [
      codes[selection],
      ...codes.filter((_, index) => index !== selection),
    ];

    saveCodes(updatedCodes);
  } else {
    if (codes.length === 0) {
      process.stdout.write("There are no spaces.\n");
      process.exit();
    }
    codes.forEach((code, index) => {
      const url = `https://app.floatingfile.space/s/${code}`;
      if (index === 0) {
        process.stdout.write(chalk.green(`(default) ${code} ${url}\n`));
      } else {
        process.stdout.write(`(${index}) ${code} ${url}\n`);
      }
    });
  }

  process.exit(0);
};
