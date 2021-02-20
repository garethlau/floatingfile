import express, { Request, Response } from "express";
import { File, HistoryRecord, Space, SpaceDocument } from "@floatingfile/types";
import s3 from "../../s3";
import { broadcast, EventTypes } from "../../services/subscriptionManager";
import Honeybadger from "honeybadger";
import { S3_BUCKET_NAME } from "../../config";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = express.Router();
const mongoose = require("mongoose");
const Space = mongoose.model("Space");

// Get a space
router.get("/:code", async (req: Request, res: Response) => {
  const code: string = req.params.code;
  if (!code) {
    return res.status(400).send({ message: "Invalid request." });
  }
  try {
    const space: Space = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    } else {
      return res.status(200).send({ space });
    }
  } catch (error) {
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

// Create a new space
router.post("/", async (req: Request, res: Response) => {
  // generate code
  try {
    const buf = crypto.randomBytes(3);
    const code: string = buf.toString("hex").toUpperCase();

    let expiresIn: number =
      24 /* hours */ *
      60 /* mins */ *
      60 /* seconds */ *
      1000; /* milliseconds */
    let space = new Space({
      code: code,
      files: [],
      expires: Date.now() + expiresIn,
      history: [],
      users: [],
    });
    const savedSpace: Space = await space.save();
    return res.status(200).send({ space: savedSpace });
  } catch (error) {
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

// Delete a space
router.delete("/:code", async (req, res) => {
  let code: string = req.params.code;

  if (!code) {
    return res.status(400).send({ message: "Invalid request." });
  }
  try {
    // Delete the space
    let deletedSpace = await Space.findOneAndDelete({ code: code }).exec();
    if (!deletedSpace) {
      return res.status(404).send({ message: "Space does not exist." });
    }

    if (deletedSpace.files.length === 0) {
      return res.status(200).send();
    }

    // Remove files from S3
    const files: File[] = deletedSpace.files;
    let s3Keys = files.map((file) => file.key);

    let params = {
      Bucket: S3_BUCKET_NAME,
      Delete: {
        Objects: s3Keys.map((s3Key) => {
          return { Key: s3Key };
        }),
        Quiet: false,
      },
    };

    await new Promise((resolve, reject) => {
      s3.deleteObjects(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    Honeybadger.notify(error);
    return res.status(500).send();
  } finally {
    broadcast(code, EventTypes.SPACE_DELETED);
  }
});
router.delete("/:code/files/:key", async (req, res) => {
  const { code, key } = req.params;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  try {
    // Find the space
    const space = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }

    // Remove the file from s3
    const params = {
      Key: key,
      Bucket: S3_BUCKET_NAME,
    };
    await s3.deleteObject(params);

    // Remove the file from the space
    const removedFile = space.files.find((file: File) => file.key === key);
    space.files = space.files.filter((file: File) => file.key !== key);

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

    broadcast(code, EventTypes.HISTORY_UPDATED);

    return res.status(200).send({ space: updatedSpace });
  } catch (error) {
    console.log(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

// Remove multiple files
router.delete("/:code/files", async (req, res) => {
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
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    }

    // Remove objects from s3
    const params = {
      Bucket: "examplebucket",
      Delete: {
        Objects: toRemove.map((key) => ({ Key: key })),
        Quiet: false,
      },
    };

    await s3.deleteObjects(params);

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
    const updatedSpace: SpaceDocument = await space.save();

    broadcast(code, EventTypes.FILES_UPDATED);

    return res
      .status(200)
      .send({ message: "Files removed.", space: updatedSpace });
  } catch (error) {
    console.error(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

router.patch("/:code/file", async (req, res) => {
  const { code } = req.params;
  const { key, size, name, type, ext } = req.body;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  if (!code) {
    return res.status(422).send({ message: "No code supplied." });
  }
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space not found." });
    }

    // Attach the file object to the space
    const newFile: File = { key, size, name, type, ext };
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

    const updatedSpace: SpaceDocument = await space.save();

    broadcast(code, EventTypes.FILES_UPDATED);

    return res
      .status(200)
      .send({ message: "File added to space.", space: updatedSpace });
  } catch (error) {
    console.log(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

router.get("/:code/files", async (req, res) => {
  const { code } = req.params;
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
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
    console.error(error);
    Honeybadger.notify(error);
    return res.status(500).send();
  }
});

router.get("/:code/files/zip", async (req, res: any) => {
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
    const space: SpaceDocument = await Space.findOne({ code }).exec();

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
    console.error(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

router.delete("/:code/files/zip", (req, res) => {
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

router.patch("/:code/history", async (req, res) => {
  const { code } = req.params;
  const { action, payload }: { action: string; payload: string } = req.body;
  const username: string =
    typeof req.headers.username === "string" ? req.headers.username : "";

  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space not found." });
    }

    if (action === "DOWNLOAD_FILE") {
      const downloadedFile: File | undefined = space.files.find(
        (file) => file.key === payload
      );

      if (!downloadedFile) {
        return res.status(404).send({ message: "File not found." });
      }

      const historyRecord: HistoryRecord = {
        action: "DOWNLOAD",
        author: username,
        payload: downloadedFile.name,
        timestamp: Date.now().toString(),
      };

      space.history = [...space.history, historyRecord];
    }

    const updatedSpace = await space.save();

    broadcast(code, EventTypes.HISTORY_UPDATED);

    return res
      .status(200)
      .send({ message: "History updated.", space: updatedSpace });
  } catch (error) {
    console.error(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

router.get("/:code/history", async (req, res) => {
  const { code } = req.params;
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }
    const { history } = space;
    return res.status(200).send({ history });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.get("/:code/users", async (req, res) => {
  const { code } = req.params;
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }
    const { users } = space;
    return res.status(200).send({ users });
  } catch (error) {
    Honeybadger.notify(error);
    console.error(error);
    return res.status(500).send();
  }
});

export default router;
