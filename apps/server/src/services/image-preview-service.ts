import sharp from "sharp";
import { S3_BUCKET_NAME, USE_LOCAL_S3 } from "../config";
import convert from "heic-convert";
import { isHeic } from "../utils/image-utils";
import Honeybadger from "../lib/honeybadger";
import s3 from "../lib/s3";

/**
 * Helper function to create a modified S3 key for file previews.
 *
 * @param key AWS S3 Key
 * @returns Modified S3 key
 */
function createPreviewKey(key: string): string {
  return key + "-preview";
}

/**
 * Create and save file preview to S3.
 * @param param0 File object to create the preview for. Will create a preview
 * based on the type. If the type is not supported, the function will return
 * immediately.
 */
export async function createPreview({
  key,
  type,
}: {
  key: string;
  type: string;
}): Promise<string | undefined> {
  if (type.includes("image")) {
    return await createImagePreview(key);
  } else {
    return;
  }
}
/**
 *
 * @param keys List of S3 keys to delete file previews for.
 */
export async function deletePreviews(keys: string[]) {
  const objects = keys.map((key) => ({
    Key: createPreviewKey(key),
  }));
  return s3
    .deleteObjects({
      Bucket: S3_BUCKET_NAME,
      Delete: {
        Objects: objects,
        Quiet: false,
      },
    })
    .promise();
}

/**
 *
 * @param key S3 key to delete file preview for.
 */
export async function deletePreview(key: string) {
  return s3
    .deleteObject({
      Key: createPreviewKey(key),
      Bucket: S3_BUCKET_NAME,
    })
    .promise();
}

export async function createImagePreview(key: string): Promise<string> {
  const obj = await s3
    .getObject({ Key: key, Bucket: S3_BUCKET_NAME })
    .promise();
  const bodyBuffer = obj.Body as Buffer;

  let buffer: Buffer;
  if (isHeic(bodyBuffer)) {
    // convert HEIC to JPEG
    const outputBuffer = await convert({
      buffer: bodyBuffer, // the HEIC file buffer
      format: "JPEG", // output format
      quality: 1, // the jpeg compression quality, between 0 and 1
    });
    buffer = outputBuffer;
  } else {
    buffer = bodyBuffer;
  }
  try {
    const resizedBuffer = await sharp(buffer)
      .jpeg({
        quality: 75,
      })
      .resize(64, 64, { fit: "cover" })
      .toBuffer();

    const previewKey = createPreviewKey(key);
    await s3
      .putObject({
        Key: previewKey,
        Bucket: S3_BUCKET_NAME,
        Body: resizedBuffer,
        ACL: "public-read",
      })
      .promise();

    let previewUrl;
    if (USE_LOCAL_S3) {
      previewUrl = `http://localhost:9000/${S3_BUCKET_NAME}/${previewKey}`;
    } else {
      previewUrl = `https://${S3_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${previewKey}`;
    }
    return previewUrl;
  } catch (error) {
    Honeybadger.notify(error);
  }
}
