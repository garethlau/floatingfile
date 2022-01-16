import { v4 as uuidv4 } from "uuid";
import {
  PostdownloadFn,
  PostuploadFn,
  PredownloadFn,
  PreuploadFn,
  RemoveFn,
  RemoveManyFn,
  NotificationTypes,
  InitChunkUploadFn,
  AbortChunkUploadFn,
  CompleteChunkUploadFn,
  EventType,
} from "@floatingfile/types";
import {
  prepUpload,
  endUpload,
  prepDownload,
  remove as removeFile,
  removeMany as removeFiles,
} from "../services/files-service";
import { notifyAll } from "../services/notification-service";
import prisma from "../lib/prisma";
import s3 from "../lib/s3";
import { S3_BUCKET_NAME } from "../config";
import Honeybadger from "../lib/honeybadger";
import { accessLogger } from "../lib/logger";

export const initChunkUpload: InitChunkUploadFn = async (params: {
  numChunks: string;
}) => {
  accessLogger.info("initChunkUpload");
  try {
    const { numChunks } = params;
    const key = uuidv4();
    const response = await s3
      .createMultipartUpload({
        Bucket: S3_BUCKET_NAME,
        Key: key,
      })
      .promise();
    const uploadId = response.UploadId;

    const promises = [];
    for (let i = 0; i < parseInt(numChunks); i++) {
      promises.push(
        s3.getSignedUrlPromise("uploadPart", {
          Bucket: S3_BUCKET_NAME,
          Key: key,
          UploadId: uploadId,
          PartNumber: i + 1,
        })
      );
    }

    const signedUrls = await Promise.all(promises);
    return { signedUrls, key, uploadId };
  } catch (error) {
    Honeybadger.notify(error);
    throw error;
  }
};

export const abortChunkUpload: AbortChunkUploadFn = async (params: {
  key: string;
  uploadId: string;
}) => {
  accessLogger.info("abortChunkUpload");
  const { uploadId, key } = params;
  await s3
    .abortMultipartUpload({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    })
    .promise();
  return;
};

export const completeChunkUpload: CompleteChunkUploadFn = async (params: {
  uploadId: string;
  key: string;
  parts: {
    eTag: string;
    number: string;
  }[];
}) => {
  accessLogger.info("completeChunkUpload");
  const { uploadId, key, parts } = params;
  try {
    await s3
      .completeMultipartUpload({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map(({ eTag, number }) => ({
            ETag: eTag,
            PartNumber: parseInt(number),
          })),
        },
      })
      .promise();
  } catch (error) {
    Honeybadger.notify(error);
    throw error;
  }
  return;
};

export const preupload: PreuploadFn = async (params: {
  code: string;
  size: string;
}) => {
  accessLogger.info("preupload");
  const data = await prepUpload(params.code, params.size);
  if (!data) return null;

  const { signedUrl, key } = data;
  return { signedUrl, key };
};

export const postupload: PostuploadFn = async (params: {
  code: string;
  username: string;
  file: {
    key: string;
    name: string;
    type: string;
    ext: string;
    size: string;
  };
}) => {
  accessLogger.info("postupload");
  const { code, username, file } = params;
  await endUpload(code, file, () => {
    // this is called when the image preview is complete
    notifyAll(code, NotificationTypes.SPACE_UPDATED);
  });
  await prisma.event.create({
    data: {
      belongsTo: code,
      author: username,
      payload: file.name,
      action: EventType.UPLOAD,
    },
  });
  await notifyAll(code, NotificationTypes.SPACE_UPDATED);
  return;
};

export const predownload: PredownloadFn = async (params: { id: string }) => {
  accessLogger.info("predownload");
  const { id } = params;
  const { signedUrl } = await prepDownload(id);
  return { signedUrl };
};

export const postdownload: PostdownloadFn = async (params: {
  code: string;
  username: string;
  name: string;
}) => {
  accessLogger.info("postdownload");
  const { username, code, name } = params;
  await prisma.event.create({
    data: {
      belongsTo: code,
      author: username,
      payload: name,
      action: EventType.DOWNLOAD,
    },
  });
  await notifyAll(code, NotificationTypes.SPACE_UPDATED);
  return;
};

export const remove: RemoveFn = async (params: {
  username: string;
  id: string;
}) => {
  accessLogger.info("remove");
  const { username, id } = params;
  const file = await removeFile(id);

  await prisma.event.create({
    data: {
      belongsTo: file.belongsTo,
      author: username,
      payload: file.name,
      action: EventType.REMOVE,
    },
  });
  notifyAll(file.belongsTo, NotificationTypes.SPACE_UPDATED);
  return;
};

export const removeSingle = remove;
export const removeMany: RemoveManyFn = async (params: {
  username: string;
  ids: string[];
}) => {
  accessLogger.info("removeMany");
  const { ids, username } = params;
  const files = await removeFiles(ids);

  await Promise.all(
    files.map((file) =>
      prisma.event.create({
        data: {
          belongsTo: file.belongsTo,
          author: username,
          payload: file.name,
          action: EventType.REMOVE,
        },
      })
    )
  );

  files
    .map(({ belongsTo }) => belongsTo)
    .filter((value, index, self) => self.indexOf(value) === index)
    .forEach((code) => {
      notifyAll(code, NotificationTypes.SPACE_UPDATED);
    });
  return;
};
