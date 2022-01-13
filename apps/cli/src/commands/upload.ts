import type { Arguments, CommandBuilder } from "yargs";
import chalk from "chalk";
import request from "request";
import progressStream from "progress-stream";
import cliProgress from "cli-progress";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import rpcClient from "../lib/rpc";
import { fetchCodes } from "../lib/storage";
import { doesSpaceExist } from "../utils";
import rl, { prompt } from "../lib/readline";

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
  if (!code) {
    process.stdout.write(chalk.red("Missing required code.\n"));
    process.exit();
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

  // create container for progress bars
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: "[{bar}] {percentage}% | {transferred}/{length} bytes | {filename}",
  });

  const promises = files.map(async (file) => {
    const filePath = path.join(dir, file);
    const { size } = fs.statSync(filePath);

    // create an upload progress bar for this file
    const bar = multibar.create(100, 0, {
      filename: file,
      transferred: 0,
      length: size,
    });

    const { signedUrl, key } = await rpcClient.invoke("preupload", {
      code: code,
      size: size.toString(),
    });

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          // pipe to progress stream
          progressStream({ length: size }).on("progress", (progress) => {
            // update the progress bar
            bar.update(progress.percentage, {
              filename: file,
              transferred: progress.transferred,
              length: progress.length,
            });
          })
        )
        // pipe to request to upload file
        .pipe(request.put(signedUrl))
        .on("response", resolve)
        .on("error", reject);
    });

    await rpcClient.invoke("postupload", {
      code: code,
      username: "",
      file: {
        size: size.toString(),
        name: file,
        type: mime.lookup(file) || "application/octet-stream",
        ext: path.extname(file),
        key,
      },
    });
    // return the path of the uploaded file
    return path.join(process.cwd(), dir, file);
  });

  const paths = await Promise.all(promises);
  multibar.stop();

  process.stdout.write("\nSuccessfully uploaded:\n");

  paths.forEach((p) => {
    process.stdout.write(`${p}\n`);
  });
  rl.close();

  process.exit(0);
};
