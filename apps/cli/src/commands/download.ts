import type { Arguments, CommandBuilder } from "yargs";
import path from "path";
import fs from "fs";
import rpcClient from "../lib/rpc";
import axios from "axios";
import { fetchCodes, fetchConfig } from "../lib/storage";
import rl, { prompt } from "../lib/readline";
import chalk from "chalk";

type Options = {
  code: string | undefined;
  all: boolean | undefined;
  dir: string | undefined;
};

export const command: string = "download [dir]";
export const desc: string = "Download files from a space";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      code: { type: "string" },
      all: { type: "boolean", description: "download all" },
    })

    .default("dir", "./")
    .positional("dir", { type: "string", demandOption: false })
    .alias("a", "all");

async function saveFile(writer: fs.WriteStream, data: any) {
  return new Promise((resolve, reject) => {
    data.pipe(writer);
    writer.on("error", (err) => {
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      resolve(true);
    });
  });
}

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const username: string = fetchConfig("username");
  let code = "";
  const { code: inputCode, dir = "./", all } = argv;

  if (!inputCode) {
    const codes = await fetchCodes();
    code = codes[0];
  } else {
    code = inputCode;
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

  let selections = [];
  if (all) {
    selections = files.map((_, index) => index);
  } else {
    let question = "Which files do you want to download?\n";
    files.forEach((file, index) => {
      const uploadedAt = new Date(file.createdAt).toLocaleTimeString();
      question += `(${index}) ${file.name} ${uploadedAt}\n`;
    });

    const input = await prompt(question);

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

  const promises = selections.map(
    (selection) =>
      new Promise(async (resolve, reject) => {
        const file = files[selection];
        const writer = fs.createWriteStream(path.join(dir, file.name));

        try {
          const { signedUrl } = await rpcClient.invoke("predownload", {
            id: file.id,
          });

          const response = await axios.get(signedUrl, {
            responseType: "stream",
            onDownloadProgress: (event) => {
              console.log(event);
            },
          });
          await saveFile(writer, response.data);

          await rpcClient.invoke("postdownload", {
            code,
            username,
            name: file.name,
          });
          resolve(path.join(process.cwd(), dir, file.name).toString());
        } catch (error) {
          reject(error);
        }
      })
  );

  const filePaths = await Promise.all(promises);

  process.stdout.write("Successfully downloaded:\n");
  filePaths.forEach((p) => {
    process.stdout.write(`${p}\n`);
  });
  rl.close();

  process.exit(0);
};
