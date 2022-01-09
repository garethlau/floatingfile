import fs from "fs";
import crypto from "crypto";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { S3_BUCKET_NAME } from "../config";
import {
  createPreview,
  deletePreview,
  deletePreviews,
} from "./image-preview-service";
import prisma from "../lib/prisma";
import s3 from "../lib/s3";

// Directory where ZIP files are stored
const TMP_DIR = path.join(__dirname, "..", "..", "..", "tmp");

export const prepUpload = async (code: string, size: string) => {
  // TODO: Check if the space is max capacity
  const key = uuidv4();

  const params = {
    Key: key,
    Bucket: S3_BUCKET_NAME,
  };
  const signedUrl = s3.getSignedUrl("putObject", params);
  return { signedUrl, key };
};
export const endUpload = async (
  code: string,
  file: {
    key: string;
    name: string;
    type: string;
    ext: string;
    size: string;
  }
) => {
  const { key, name, type, ext, size } = file;
  const previewUrl = await createPreview({ key, type });
  await prisma.file.create({
    data: {
      belongsTo: code,
      key,
      name,
      type,
      ext,
      size: parseInt(size, 10),
      previewUrl,
    },
  });
};
export const prepDownload = async (id: string) => {
  const file = await prisma.file.findUnique({ where: { id } });
  // TODO: Handle file not found
  const key = file.key;
  const params = {
    Key: key,
    Bucket: S3_BUCKET_NAME,
  };
  const signedUrl = s3.getSignedUrl("getObject", params);
  return signedUrl;
};

export const endDownload = async () =>
  // Do nothing
  {
    return;
  };

export const prepZip = async (ids: string[]) => {
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
  fs.mkdirSync(path.join(TMP_DIR, folderName));

  // Download each file from s3
  const promises = files.map(
    ({ key, name }) =>
      new Promise<{ path: string; name: string }>((resolve, reject) => {
        const params = {
          Key: key,
          Bucket: S3_BUCKET_NAME,
        };
        const filepath = path.join(TMP_DIR, folderName, name);
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

  return { filename: `${folderName}.zip`, files: values };
};
export const zip = async () => {
  // Do nothing
  return;
};
export const endZip = (folderName: string) => {
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
  }, 10000);
  return;
};

export const remove = async (id: string) => {
  const file = await prisma.file.delete({
    where: {
      id,
    },
  });

  const params = {
    Key: file.key,
    Bucket: S3_BUCKET_NAME,
  };
  await s3.deleteObject(params).promise();
  await deletePreview(file.key);

  return file;
};
export const removeMany = async (ids: string[]) => {
  const files = await prisma.file.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  await prisma.file.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  const keys = files.map((file) => file.key);
  const params = {
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  };

  await s3.deleteObjects(params).promise();
  await deletePreviews(keys);
  return files;
};
