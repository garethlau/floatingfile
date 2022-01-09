import { Router } from "express";
import prisma from "../lib/prisma";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { S3_BUCKET_NAME } from "../config";
import s3 from "../lib/s3";

const router = Router();
const TMP_DIR = path.join(__dirname, "..", "..", "..", "tmp");
const CLEANUP_AFTER = 3000;

router.get("/", async (req, res) => {
  let ids;
  if (typeof req.query.ids === "string") {
    ids = JSON.parse(req.query.ids);
    if (!Array.isArray(ids)) {
      return res.status(422).send();
    }
  }

  const files = await prisma.file.findMany({ where: { id: { in: ids } } });
  const currentDate = new Date().valueOf().toString();
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }
  const random = Math.random().toString();
  const folderName = crypto
    .createHash("sha1")
    .update(currentDate + random)
    .digest("hex");
  const folderPath = path.join(TMP_DIR, folderName);
  fs.mkdirSync(folderPath);

  // Download each file from s3
  const promises = files.map(
    ({ key, name }) =>
      new Promise<{ path: string; name: string }>((resolve, reject) => {
        const params = {
          Key: key,
          Bucket: S3_BUCKET_NAME,
        };
        const filepath = path.join(folderPath, name);
        const fileStream = fs.createWriteStream(filepath);
        const s3Stream = s3.getObject(params).createReadStream();
        s3Stream.on("error", (error) => reject(error));
        s3Stream
          .pipe(fileStream)
          .on("error", (error) => reject(error))
          .on("close", () => resolve({ path: filepath, name }));
      })
  );
  const values = await Promise.all(promises);
  const deleteFolderRecursive = (path: string) => {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file: string) => {
        let curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };

  const hash = folderName.split(".")[0];
  setTimeout(() => {
    deleteFolderRecursive(path.join(TMP_DIR, hash));
  }, CLEANUP_AFTER);

  return res.zip({ files: values, filename: `${folderName}.zip` });
});

export default router;
