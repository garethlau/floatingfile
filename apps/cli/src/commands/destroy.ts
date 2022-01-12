import chalk from "chalk";
import type { Arguments, CommandBuilder } from "yargs";
import rpcClient from "../lib/rpc";
import { fetchCodes, removeCode } from "../lib/storage";
import { doesSpaceExist } from "../utils";

type Options = {
  code: string | undefined;
};

export const command: string = "destroy";
export const desc: string = "Destroy space with <code>";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      upper: { type: "boolean" },
    })
    .positional("name", { type: "string", demandOption: true });

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { code: inputCode } = argv;

  let code = "";
  if (inputCode) {
    code = inputCode;
  } else {
    const codes = await fetchCodes();
    code = codes[0];
  }

  if (!(await doesSpaceExist(code))) {
    process.stdout.write(chalk.red("Space does not exist\n"));
    process.exit();
  }

  await rpcClient.invoke("destroySpace", { code });
  removeCode(code);

  process.stdout.write("Space has been destroyed.\n");

  process.exit(0);
};
