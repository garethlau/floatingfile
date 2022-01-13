import type { Arguments, CommandBuilder } from "yargs";
import rpcClient from "../lib/rpc";
import { addCode, fetchCodes, fetchConfig } from "../lib/storage";
import rl, { promptNums, promptYesNo } from "../lib/readline";
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
    addCode(code);
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
    const confirm = await promptYesNo(
      `Are you sure you want to remove all ${files.length} files? (y/n)`
    );
    if (!confirm) process.exit();
    selections = files.map((_, index) => index);
  } else {
    let query = "Which files do you want to remove?\n";

    files.forEach((file, index) => {
      const uploadedAt = new Date(file.createdAt).toLocaleTimeString();
      query += `(${index}) ${file.name} ${uploadedAt}\n`;
    });

    try {
      selections = await promptNums(query, { min: 0, max: files.length - 1 });
    } catch (error) {
      process.stdout.write(chalk.red(`${error.message}\n`));
      process.exit();
    }
  }

  const ids = selections.map((selection) => files[selection].id);
  await rpcClient.invoke("removeFiles", { username, ids });

  rl.close();
  process.exit(0);
};
