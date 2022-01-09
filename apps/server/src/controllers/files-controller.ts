import {
  PostdownloadFn,
  PostuploadFn,
  PredownloadFn,
  PreuploadFn,
  RemoveFn,
  RemoveManyFn,
  NotificationTypes,
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

export const preupload: PreuploadFn = async (params: {
  code: string;
  size: string;
}) => {
  const { signedUrl, key } = await prepUpload(params.code, params.size);
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
  const { code, username, file } = params;
  await endUpload(code, file);
  await prisma.event.create({
    data: {
      belongsTo: code,
      author: username,
      payload: file.name,
      action: "UPLOAD",
    },
  });
  await notifyAll(code, NotificationTypes.SPACE_UPDATED);
  return;
};

export const predownload: PredownloadFn = async (params: { id: string }) => {
  const { id } = params;
  const signedUrl = await prepDownload(id);
  return { signedUrl };
};

export const postdownload: PostdownloadFn = async (params: {
  code: string;
  username: string;
  name: string;
}) => {
  const { username, code, name } = params;
  await prisma.event.create({
    data: {
      belongsTo: code,
      author: username,
      payload: name,
      action: "DOWNLOAD",
    },
  });
  await notifyAll(code, NotificationTypes.SPACE_UPDATED);
  return;
};

export const remove: RemoveFn = async (params: {
  username: string;
  id: string;
}) => {
  const { username, id } = params;
  const file = await removeFile(id);

  await prisma.event.create({
    data: {
      belongsTo: file.belongsTo,
      author: username,
      payload: file.name,
      action: "REMOVE",
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
  const { ids, username } = params;
  const files = await removeFiles(ids);

  await Promise.all(
    files.map((file) =>
      prisma.event.create({
        data: {
          belongsTo: file.belongsTo,
          author: username,
          payload: file.name,
          action: "REMOVE",
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
