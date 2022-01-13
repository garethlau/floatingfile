import {
  FindSpaceFn,
  CreateSpaceFn,
  DestroySpaceFn,
  NotificationTypes,
} from "@floatingfile/types";
import { create, find, remove } from "../services/space-service";
import { notifyAll } from "../services/notification-service";
import prisma from "../lib/prisma";
import Honeybadger from "../lib/honeybadger";

export const createSpace: CreateSpaceFn = async (params: {
  username: string;
}) => {
  const { username } = params;
  const space = await create();

  await prisma.event.create({
    data: {
      belongsTo: space.code,
      author: username,
      action: "CREATE",
    },
  });

  return {
    code: space.code,
    createdAt: space.createdAt.toString(),
    updatedAt: space.updatedAt.toString(),
  };
};

export const findSpace: FindSpaceFn = async (params: { code: string }) => {
  const { code } = params;
  if (!code) return null;
  const space = await find(code);
  if (!space) return null;

  // TODO: Check if space is expired
  let expired = false;
  if (expired) {
    // Destroy the space
    await remove(code);
  }

  return {
    code: space.code,
    updatedAt: space.updatedAt.toString(),
    createdAt: space.createdAt.toString(),
    files: space.files.map((file) => ({
      id: file.id,
      ext: file.ext,
      key: file.key,
      name: file.name,
      size: file.size.toString(),
      type: file.type,
      previewUrl: file.previewUrl,
      belongsTo: file.belongsTo,
      createdAt: file.createdAt.toString(),
      updatedAt: file.updatedAt.toString(),
    })),
    events: space.events.map((event) => ({
      id: event.id,
      action: event.action,
      author: event.author,
      payload: event.payload,
      belongsTo: event.belongsTo,
      createdAt: event.createdAt.toString(),
      updatedAt: event.updatedAt.toString(),
    })),
    clients: space.clients.map((client) => ({
      id: client.id,
      username: client.username,
      connectedTo: client.connectedTo,
      createdAt: client.createdAt.toString(),
    })),
  };
};

export const destroySpace: DestroySpaceFn = async (params: {
  code: string;
}) => {
  const { code } = params;
  try {
    await remove(code);
  } catch (error) {
    Honeybadger.notify(error);
  }
  await notifyAll(code, NotificationTypes.SPACE_DESTROYED);
  return;
};
