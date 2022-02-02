import type { Arguments, CommandBuilder } from "yargs";
import chalk from "chalk";
import cliProgress from "cli-progress";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import axios from "axios";
import { doesSpaceExist } from "../utils";
import rpcClient from "../lib/rpc";
import { addCode, fetchCodes } from "../lib/storage";
import rl, { promptNums, promptYesNo } from "../lib/readline";
import { fetchConfig } from "../lib/storage";

type Options = {
  code: string | undefined;
  all: boolean | undefined;
  path: string | undefined;
};

export const command: string[] = ["upload [path]", "ul [path]"];
export const desc: string = "Upload files to space";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs
    .options({
      code: {
        type: "string",
        description:
          "Code of the space to upload files to. Will fallback to the most recently accessed space.",
      },
      all: {
        type: "boolean",
        description: "Upload all files within the directory.",
      },
    })
    .default("path", "./")
    .positional("path", { type: "string", demandOption: false })
    .alias("a", "all");

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  let code = "";
  const { code: inputCode, path: p = "./", all } = argv;
  const isFile = fs.lstatSync(p).isFile();

  if (!inputCode) {
    const codes = await fetchCodes();
    code = codes[0];
  } else {
    code = inputCode;
    addCode(code);
  }
  if (!code) {
    process.stdout.write(chalk.red("Missing required code.\n"));
    process.exit();
  }

  if (!(await doesSpaceExist(code))) {
    process.stdout.write(chalk.red("Space does not exist.\n"));
    process.exit();
  }

  let files = [];
  if (isFile) {
    // provided path is a path to a file
    files.push(p);
  } else {
    // provided path is a path to a director
    const candidates = fs
      .readdirSync(p)
      .filter((name) => fs.lstatSync(path.join(p, name)).isFile());
    if (all) {
      // Upload all files
      const confirm = await promptYesNo(
        `Are you sure you want to upload all ${candidates.length} files? (y/n):`
      );
      if (!confirm) {
        process.exit();
      }
      files = candidates;
    } else {
      try {
        candidates.forEach((file, index) => {
          process.stdout.write(`(${index}) ${file}\n`);
        });
        const selections = await promptNums(
          "Which files do you want to upload?",
          {
            min: 0,
            max: candidates.length - 1,
          }
        );
        files = selections.map((selection) => candidates[selection]);
      } catch (error) {
        if (error instanceof RangeError || error instanceof TypeError) {
          process.stdout.write(chalk.red(`${error.message}\n`));
        } else process.stdout.write(chalk.red(`Unexpected error occured.\n`));
        process.exit();
      }
    }
  }

  // create container for progress bars
  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: "[{bar}] {percentage}% | {transferred}/{length} bytes | {filename}",
  });

  const promises = files.map(async (file) => {
    const filePath = isFile ? p : path.join(p, file);
    const { size } = fs.statSync(filePath);

    // create an upload progress bar for this file
    const bar = multibar.create(100, 0, {
      filename: file,
      transferred: 0,
      length: size,
    });

    const CHUNK_SIZE = 5 * 1024 * 1024;
    const total = Math.ceil(size / CHUNK_SIZE);
    const { signedUrls, key, uploadId } = await rpcClient.invoke(
      "initChunkUpload",
      {
        numChunks: total.toString(),
      }
    );

    let chunkNumber = 0;
    let transferred = 0;
    const parts: { eTag: string; number: string }[] = [];

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(filePath, {
        highWaterMark: CHUNK_SIZE,
      });

      readStream
        .on("data", async (chunk) => {
          // retreive the signed url for the chunk
          const signedUrl = signedUrls[chunkNumber];

          // pause the stream while uploading
          readStream.pause();
          const response = await axios.put(signedUrl, chunk);

          // save the eTag and chunk number, needed to complete the upload
          const eTag = response.headers.etag;
          const number = (chunkNumber + 1).toString();
          parts.push({ eTag, number });

          chunkNumber++;
          transferred += chunk.length;

          // update the progress bar
          bar.update((transferred / size) * 100, {
            filename: file,
            transferred: transferred,
            length: size,
          });

          // resume the stream to upload the next chunk
          readStream.resume();
        })
        .on("end", () => {
          resolve(null);
        })
        .on("error", reject);
    });

    // complete the chunk upload
    await rpcClient.invoke("completeChunkUpload", {
      uploadId,
      key,
      parts,
    });

    await rpcClient.invoke("postupload", {
      code: code,
      username: fetchConfig("username"),
      file: {
        size: size.toString(),
        name: file,
        type: mime.lookup(file) || "application/octet-stream",
        ext: path.extname(file),
        key,
      },
    });
    // return the path of the uploaded file
    if (path.isAbsolute(p)) {
      return filePath;
    } else {
      return isFile
        ? path.join(process.cwd(), p)
        : path.join(process.cwd(), p, file);
    }
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
