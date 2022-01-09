import AWS from "aws-sdk";
import {
  AWS_ACCESS_KEY_ID,
  AWS_ACCESS_KEY_SECRET,
  S3_BUCKET_NAME,
  USE_LOCAL_S3,
} from "../config";
import logger from "winston";

let client: AWS.S3;
if (USE_LOCAL_S3) {
  client = new AWS.S3({
    accessKeyId: "minio",
    secretAccessKey: "minio123",
    endpoint: "http://127.0.0.1:9000",
    s3ForcePathStyle: true,
    signatureVersion: "v4",
  });

  client.createBucket({ Bucket: S3_BUCKET_NAME }, (err) => {
    if (err) {
      if (err.statusCode === 409) {
        logger.info(`Bucket (${S3_BUCKET_NAME}) already exists`);
      } else {
        logger.error(err);
      }
    } else {
      logger.info(`Created new bucket ${S3_BUCKET_NAME}`);
    }
  });
} else {
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_ACCESS_KEY_SECRET,
    signatureVersion: "v4",
    region: "us-east-2",
  });

  client = new AWS.S3();
}
export default client;
