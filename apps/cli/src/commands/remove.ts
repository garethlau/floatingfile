import type { Arguments, CommandBuilder } from "yargs";
import rpcClient from "../lib/rpc";
import { fetchCodes, fetchConfig } from "../lib/storage";
import rl, { prompt } from "../lib/readline";
import chalk from "chalk";

type Options = {
  code: string | undefined;
  all: boolean | undefined;
};

export const command: string = "remove";
export const desc: string = "Remove files from a space";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      code: { type: "string" },
      all: { type: "boolean", description: "remove all files" },
    })
    .alias("a", "all");

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const username: string = fetchConfig("username");
  let code = "";
  const { code: inputCode, all } = argv;

  if (!inputCode) {
    const codes = await fetchCodes();
    code = codes[0];
  } else {
    code = inputCode;
  }

  const space = await rpcClient.invoke("findSpace", { code });
  if (!space) {
    process.stdout.write("Space does not exist.\n");
    process.exit();
  }

  const files = space.files;
  if (files.length === 0) {
    process.stdout.write("Space has no files.\n");
    process.exit();
  }

  let selections = [];
  if (all) {
    const input = await prompt("Do you want to remove all files? (y/n):");
    if (input === "y" || input === "yes" || input === "Y") {
      selections = files.map((_, index) => index);
    } else {
      process.exit();
    }
  } else {
    let query = "Which files do you want to remove?\n";

    files.forEach((file, index) => {
      const uploadedAt = new Date(file.createdAt).toLocaleTimeString();
      query += `(${index}) ${file.name} ${uploadedAt}\n`;
    });

    const input = await prompt(query);
    selections = input.split(/[ ,]+/).map((s) => {
      let parsed = parseInt(s, 10);
      if (isNaN(parsed)) {
        process.stdout.write(chalk.red(`Invalid input: ${s}\n`));
        process.exit();
      }
      if (parsed < 0 || parsed > files.length - 1) {
        process.stdout.write(chalk.red(`Out of range: ${s}\n`));
        process.exit();
      }
      return parseInt(s, 10);
    });
  }

  const ids = selections.map((selection) => files[selection].id);
  await rpcClient.invoke("removeFiles", { username, ids });

  rl.close();
  process.exit(0);
};
