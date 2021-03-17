import express, { Request, Response } from "express";
import { File, HistoryRecord, Space, SpaceDocument } from "@floatingfile/types";
import s3 from "../../s3";
import { broadcast, EventTypes } from "../../services/subscriptionManager";
import { S3_BUCKET_NAME } from "../../config";
import crypto from "crypto";
import { deletePreviews } from "../../services/previews";
import filesRouter from "./files";

const router = express.Router();
const mongoose = require("mongoose");
const Space = mongoose.model("Space");

router.use("/:code/files", filesRouter);

// Get a space
router.get("/:code", async (req: Request, res: Response, done) => {
  const code: string = req.params.code;
  if (!code) {
    return res.status(400).send({ message: "Invalid request." });
  }
  try {
    const space: Space = await Space.findOne({ code }).exec();

    // Generate signed URLs
    space.files = space.files.map((file) => {
      const params = {
        Key: file.key,
        Bucket: S3_BUCKET_NAME,
      };
      const signedUrl = s3.getSignedUrl("getObject", params);
      file.signedUrl = signedUrl;
      return file;
    });
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    }
    return res.status(200).send({ space });
  } catch (error) {
    done(error);
  }
});

// Create a new space
router.post("/", async (req: Request, res: Response, done) => {
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
    done(error);
  }
});

// Delete a space
router.delete("/:code", async (req, res, done) => {
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

    await s3.deleteObjects(params).promise();
    await deletePreviews(s3Keys);

    return res.status(200).send();
  } catch (error) {
    done(error);
  } finally {
    broadcast(code, EventTypes.SPACE_DELETED);
  }
});

router.patch("/:code/history", async (req, res, done) => {
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
    done(error);
  }
});

router.get("/:code/history", async (req, res, done) => {
  const { code } = req.params;
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }
    const { history } = space;
    return res.status(200).send({ history });
  } catch (error) {
    done(error);
  }
});

router.get("/:code/users", async (req, res, done) => {
  const { code } = req.params;
  try {
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send();
    }
    const { users } = space;
    return res.status(200).send({ users });
  } catch (error) {
    done(error);
  }
});

export default router;
