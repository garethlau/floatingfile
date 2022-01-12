import type { Arguments, CommandBuilder } from "yargs";
import path from "path";
import fs from "fs";
import rpcClient from "../lib/rpc";
import axios from "axios";
import mime from "mime-types";
import { fetchCodes } from "../lib/storage";
import { doesSpaceExist } from "../utils";
import rl, { prompt } from "../lib/readline";
import chalk from "chalk";

type Options = {
  code: string | undefined;
  all: boolean | undefined;
  dir: string | undefined;
};

export const command: string = "upload [dir]";
export const desc: string = "Upload files to space";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .option("code", {
      type: "string",
      description:
        "Code of the space to upload files to. Will fallback to the most recently accessed space.",
    })
    .default("dir", "./")
    .positional("dir", { type: "string", demandOption: false })
    .alias("a", "all");

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  let code = "";
  const { code: inputCode, dir = "./", all } = argv;

  if (!inputCode) {
    const codes = await fetchCodes();
    code = codes[0];
  } else {
    code = inputCode;
  }

  if (!(await doesSpaceExist(code))) {
    process.stdout.write(chalk.red("Space does not exist.\n"));
    process.exit();
  }

  const candidates = fs
    .readdirSync(dir)
    .filter((name) => fs.lstatSync(path.join(dir, name)).isFile());
  candidates.forEach((file, index) => {
    process.stdout.write(`(${index}) ${file}\n`);
  });

  let files = [];

  if (all) {
    // Upload all files
    files = candidates;
  } else {
    const input = await prompt("Which files do you want to upload?");
    const selections = input.split(/[ ,]+/).map((s) => {
      let parsed = parseInt(s, 10);
      if (isNaN(parsed)) {
        process.stdout.write(chalk.red(`Invalid input: ${s}\n`));
        process.exit();
      }
      if (parsed < 0 || parsed > candidates.length - 1) {
        process.stdout.write(chalk.red(`Out of range: ${s}\n`));
        process.exit();
      }
      return parseInt(s, 10);
    });
    files = selections.map((selection) => candidates[selection]);
  }

  const promises = files.map(
    (file) =>
      new Promise(async (resolve, reject) => {
        try {
          const filePath = path.join(dir, file);
          const buf = fs.readFileSync(filePath);
          const size = buf.length.toString();
          const { signedUrl, key } = await rpcClient.invoke("preupload", {
            code: code,
            size: size,
          });

          await axios.put(signedUrl, buf);

          await rpcClient.invoke("postupload", {
            code: code,
            username: "",
            file: {
              size: size,
              name: file,
              type: mime.lookup(file) || "application/octet-stream",
              ext: path.extname(file),
              key,
            },
          });
          resolve(path.join(process.cwd(), dir, file));
        } catch (error) {
          reject(error);
        }
      })
  );
  const paths = await Promise.all(promises);
  process.stdout.write("Successfully uploaded:\n");
  paths.forEach((p) => {
    process.stdout.write(`${p}\n`);
  });
  rl.close();

  process.exit(0);
};
