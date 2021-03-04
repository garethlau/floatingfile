import sharp from "sharp";
import s3 from "../s3";
import { S3_BUCKET_NAME } from "../config";

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
}) {
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

export async function createImagePreview(key: string) {
  const obj = await s3
    .getObject({ Key: key, Bucket: S3_BUCKET_NAME })
    .promise();
  const buffer = obj.Body as Buffer;
  const resizedBuffer = await sharp(buffer)
    .jpeg({
      quality: 75,
    })
    .resize(64, 64, { fit: "cover" })
    .toBuffer();

  await s3
    .putObject({
      Key: createPreviewKey(key),
      Bucket: S3_BUCKET_NAME,
      Body: resizedBuffer,
    })
    .promise();
}
