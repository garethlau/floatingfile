import express from "express";
import { File, HistoryRecord } from "@floatingfile/types";
import s3 from "../../s3";
import { broadcast, EventTypes } from "../../services/subscriptionManager";
import { S3_BUCKET_NAME } from "../../config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  createPreview,
  deletePreview,
  deletePreviews,
} from "../../services/previews";
import { SpaceModel } from "../../models";

const router = express.Router({ mergeParams: true });

router.delete("/:key", async (req, res, done) => {
  const { code, key } = req.params;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  try {
    // Find the space
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }

    // Remove the file from s3
    const params = {
      Key: key,
      Bucket: S3_BUCKET_NAME,
    };
    await s3.deleteObject(params).promise();
    await deletePreview(key);

    // Remove the file from the space
    space.files = space.files.filter((file: File) => file.key !== key);
    const removedFile = space.files.find((file: File) => file.key === key);
    if (!removedFile) {
      return res.status(404).send({ message: "No file removed." });
    }

    // Adjust the used size of the space
    space.size = space.size - removedFile.size;

    // Update the history of the space
    const historyRecord: HistoryRecord = {
      action: "REMOVE",
      payload: removedFile.name,
      author: username,
      timestamp: Date.now().toString(),
    };
    space.history = [...space.history, historyRecord];
    const updatedSpace = await space.save();

    broadcast(code, EventTypes.FILES_UPDATED);

    return res.status(200).send({ space: updatedSpace });
  } catch (error) {
    done(error);
  }
});

// Remove multiple files
router.delete("/", async (req, res, done) => {
  const { code } = req.params;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  let toRemove: string[];
  if (typeof req.query.toRemove === "string") {
    toRemove = JSON.parse(req.query.toRemove);
  } else {
    // Fail to parse keys to remove
    return res.status(422).send();
  }

  try {
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    }

    // Remove objects from s3
    const params = {
      Bucket: S3_BUCKET_NAME,
      Delete: {
        Objects: toRemove.map((key) => ({ Key: key })),
        Quiet: false,
      },
    };

    await s3.deleteObjects(params).promise();
    await deletePreviews(toRemove);

    const files: File[] = space.files;

    // Remove files from the space
    space.files = files.filter((file) => !toRemove.includes(file.key));

    // Update the history
    const removedFiles = files.filter((file) => toRemove.includes(file.key));
    const historyRecords: HistoryRecord[] = removedFiles.map((file) => ({
      action: "REMOVE",
      payload: file.name,
      author: username,
      timestamp: Date.now().toString(),
    }));

    space.history = [...space.history, ...historyRecords];

    // Save changes
    const updatedSpace = await space.save();

    broadcast(code, EventTypes.FILES_UPDATED);

    return res
      .status(200)
      .send({ message: "Files removed.", space: updatedSpace });
  } catch (error) {
    done(error);
  }
});

router.patch("/", async (req, res, done) => {
  const { code } = req.params;
  const { key, name, type, ext, size } = req.body;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  if (!code) {
    return res.status(422).send({ message: "No code supplied." });
  }
  try {
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space not found." });
    }

    // Create image preview
    const previewUrl = await createPreview({ key, type });

    // Attach the file object to the space
    const newFile: File = { key, size, name, type, ext, previewUrl };
    space.files = [...space.files, newFile];

    // Increase used space
    space.size = space.size + size;

    // Record this upload in the history
    const newHistoryRecord: HistoryRecord = {
      action: "UPLOAD",
      author: username,
      payload: name,
      timestamp: Date.now().toString(),
    };
    space.history = [...space.history, newHistoryRecord];

    const updatedSpace = await space.save();

    broadcast(code, EventTypes.FILES_UPDATED);

    return res
      .status(200)
      .send({ message: "File added to space.", space: updatedSpace });
  } catch (error) {
    done(error);
  }
});

router.get("/", async (req, res, done) => {
  const { code } = req.params;
  try {
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space not found." });
    }

    const files = space.files.map((file) => {
      const params = {
        Key: file.key,
        Bucket: S3_BUCKET_NAME,
      };
      const signedUrl = s3.getSignedUrl("getObject", params);
      file.signedUrl = signedUrl;
      return file;
    });

    return res.status(200).send({ files });
  } catch (error) {
    done(error);
  }
});

router.get("/zip", async (req, res: any, done) => {
  const { code } = req.params;

  let s3Keys: string[];
  if (typeof req.query.keys === "string") {
    s3Keys = JSON.parse(req.query.keys);
    if (!Array.isArray(s3Keys)) {
      return res.status(422).send();
    }
  } else {
    return res.status(422).send();
  }

  try {
    // Find the space
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Resource not found." });
    }

    // Get the file objects to zip
    const files = space.files.filter((file) => s3Keys.includes(file.key));

    // Create a hash as the folder name
    const currentDate = new Date().valueOf().toString();
    fs.mkdirSync(path.join(__dirname, "..", "..", "tmp"));
    const random = Math.random().toString();
    const folderName = crypto
      .createHash("sha1")
      .update(currentDate + random)
      .digest("hex");
    fs.mkdirSync(path.join(__dirname, "..", "..", "tmp", folderName));

    // Download each file from s3
    const promises = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const params = {
            Key: file.key,
            Bucket: S3_BUCKET_NAME,
          };
          const filepath = path.join(
            __dirname,
            "..",
            "..",
            "tmp",
            folderName,
            file.name
          );
          const fileStream = fs.createWriteStream(filepath);
          const s3Stream = s3.getObject(params).createReadStream();
          s3Stream.on("error", (error) => {
            reject(error);
          });

          s3Stream
            .pipe(fileStream)
            .on("error", (error: Error) => {
              reject(error);
            })
            .on("close", () => {
              resolve({ path: filepath, name: file.name });
            });
        })
    );
    const values = await Promise.all(promises);
    // TODO Add zip action to space history
    return res.zip({ files: values, filename: `${folderName}.zip` });
  } catch (error) {
    done(error);
  }
});

router.delete("/zip", (req, res) => {
  const folder: string | undefined = req.query.folder?.toString();
  if (!folder) {
    return res.status(422).send();
  }
  const hash = folder.split(".")[0];
  setTimeout(() => {
    deleteFolderRecursive(path.join(__dirname, "..", "..", "tmp", hash));
    return res.status(200).send();
  }, 10000);
});

const deleteFolderRecursive = function (path: string) {
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

export default router;
