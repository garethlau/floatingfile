import express from "express";
import s3 from "../../s3";
import { S3_BUCKET_NAME } from "../../config";
import Honeybadger from "honeybadger";
import { File, SpaceDocument } from "@floatingfile/types";

const router = express.Router();
const mongoose = require("mongoose");
const Space = mongoose.model("Space");

router.post("/", async (req, res) => {
  const { file, code }: { file: File; code: string } = req.body;
  console.log(code, file);

  try {
    // Check if the space has capacity for this file
    const space: SpaceDocument = await Space.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    }

    if (space.size + file.size >= space.capacity) {
      // Space has reached max storage capacity
      return res.status(403).send({ message: "Max capacity reached." });
    }

    // Generate signed URL
    const params = {
      Key: file.key,
      Bucket: S3_BUCKET_NAME,
    };
    const signedUrl = s3.getSignedUrl("putObject", params);

    return res.status(200).send({ signedUrl });
  } catch (error) {
    console.error(error);
    Honeybadger.notify(error);
    return res.status(500).send(error);
  }
});

export default router;
