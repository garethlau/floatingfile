import type { Arguments, CommandBuilder } from "yargs";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import request from "request";
import progressStream from "progress-stream";
import cliProgress from "cli-progress";
import rpcClient from "../lib/rpc";
import { fetchCodes, fetchConfig } from "../lib/storage";
import rl, { promptNums, promptYesNo } from "../lib/readline";

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
    const confirm = await promptYesNo(
      `Are you sure you want to download all ${files.length} files? (y/n)`
    );
    if (!confirm) process.exit();
    selections = files.map((_, index) => index);
  } else {
    let question = "Which files do you want to download?\n";
    files.forEach((file, index) => {
      const uploadedAt = new Date(file.createdAt).toLocaleTimeString();
      question += `(${index}) ${file.name} ${uploadedAt}\n`;
    });

    try {
      selections = await promptNums(question, {
        min: 0,
        max: files.length - 1,
      });
    } catch (error) {
      process.stdout.write(chalk.red(`${error.message}\n`));
      process.exit();
    }
  }

  // create container for progress bars
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: "[{bar}] {percentage}% | {downloaded}/{length} bytes | {filename}",
  });

  const promises = selections.map(async (selection) => {
    const file = files[selection];

    // create a progress bar for this file download
    const bar = multibar.create(100, 0, {
      filename: file.name,
      transferred: 0,
      length: parseInt(file.size),
    });

    // get the signed url
    const { signedUrl } = await rpcClient.invoke("predownload", {
      id: file.id,
    });

    await new Promise((resolve, reject) => {
      request
        .get(signedUrl)
        .pipe(
          // pipe data to progress stream
          progressStream({
            length: parseInt(file.size),
          }).on("progress", (progress) => {
            // update the progress bar
            bar.update(progress.percentage, {
              filename: file.name,
              downloaded: progress.transferred,
              length: progress.length,
            });
          })
        )
        // pipe data to write stream to save the file
        .pipe(fs.createWriteStream(path.join(dir, file.name)))
        .on("finish", resolve)
        .on("error", reject);
    });

    await rpcClient.invoke("postdownload", {
      code,
      username,
      name: file.name,
    });

    // return the save location
    return path.join(process.cwd(), dir, file.name).toString();
  });

  const filePaths = await Promise.all(promises);
  multibar.stop();

  process.stdout.write("\nSuccessfully downloaded:\n");
  filePaths.forEach((p) => {
    process.stdout.write(`${p}\n`);
  });
  rl.close();

  process.exit(0);
};
