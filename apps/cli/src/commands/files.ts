import type { Arguments, CommandBuilder } from "yargs";
import chalk from "chalk";
import rpcClient from "../lib/rpc";
import { addCode, fetchCodes } from "../lib/storage";

type Options = {
  code: string | undefined;
  all: boolean | undefined;
  dir: string | undefined;
};

export const command: string = "files";
export const desc: string = "Fetch files in the space.";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    code: { type: "string" },
  });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  let code = "";
  const { code: inputCode } = argv;

  if (!inputCode) {
    const codes = await fetchCodes();
    code = codes[0];
  } else {
    code = inputCode;
    addCode(code);
  }

  const space = await rpcClient.invoke("findSpace", { code });
  if (!space) {
    process.stdout.write(chalk.red("Space does not exist.\n"));
    process.exit();
  }

  const files = space.files;
  if (files.length === 0) {
    process.stdout.write("There are no files.\n");
    process.exit();
  }

  files.forEach((file) => {
    const createdAt = new Date(file.createdAt).toLocaleTimeString();
    process.stdout.write(`${file.name} ${file.size} ${createdAt}\n`);
  });

  process.exit(0);
};
