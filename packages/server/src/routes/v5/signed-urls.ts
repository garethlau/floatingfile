import { Router } from "express";
import s3 from "../../s3";
import { S3_BUCKET_NAME } from "../../config";
import { File } from "@floatingfile/types";
import { v4 as uuidv4 } from "uuid";
import SpaceModel from "../../db/models/Space";

const router = Router();

router.post("/", async (req, res, done) => {
  const { file, code }: { file: File; code: string } = req.body;

  try {
    // Check if the space has capacity for this file
    const space = await SpaceModel.findOne({ code }).exec();
    if (!space) {
      return res.status(404).send({ message: "Space does not exist." });
    }

    if (space.size + file.size >= space.capacity) {
      // Space has reached max storage capacity
      return res.status(403).send({ message: "Max capacity reached." });
    }
    // Generate key
    const key = uuidv4();

    // Generate signed URL
    const params = {
      Key: key,
      Bucket: S3_BUCKET_NAME,
    };
    const signedUrl = s3.getSignedUrl("putObject", params);

    // Return both key and signed URL
    return res.status(200).send({ signedUrl, key });
  } catch (error) {
    done(error);
  }
});

export default router;
