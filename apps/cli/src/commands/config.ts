import { Arguments, CommandBuilder } from "yargs";
import { fetchConfig, saveConfig } from "../lib/storage";

type Options = {
  key: string | undefined;
  value: string | undefined;
  list: boolean | undefined;
};

export const command: string = "config [<key>] [value]";
export const desc: string = "Retreive or set configuration";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .positional("key", {
      type: "string",
      describe: "can be username, download_to, group_by_space",
    })
    .option("value", {
      describe: "",
      type: "string",
    })
    .option("list", {
      describe: "list all configurations",
      type: "boolean",
    })
    .alias("l", "list");

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { key, value, list } = argv;
  if (list) {
    const config = fetchConfig();
    Object.keys(config).forEach((k) => {
      process.stdout.write(`${k}=${config[k]}\n`);
    });
  }

  if (key && value) {
    saveConfig(key, value);
  } else if (key) {
    const val = fetchConfig(key);
    process.stdout.write(`${key}=${val}\n`);
  }

  process.exit(0);
};
