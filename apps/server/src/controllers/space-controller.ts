import { create, find, remove } from "../services/space-service";
import { NotificationTypes, notifyAll } from "../services/notification-service";
import prisma from "../lib/prisma";
import Honeybadger from "../lib/honeybadger";

export const createSpace = async (params: { username: string }) => {
  const { username } = params;
  const space = await create();

  await prisma.event.create({
    data: {
      belongsTo: space.code,
      author: username,
      action: "CREATE",
    },
  });
  return space;
};

export const findSpace = async (params: { code: string }) => {
  const { code } = params;
  const space = await find(code);

  // TODO: Check if space is expired
  let expired = false;
  if (expired) {
    // Destroy the space
    await remove(code);
  }
  return space;
};

export const destroySpace = async (params: { code: string }) => {
  const { code } = params;
  try {
    await remove(code);
  } catch (error) {
    Honeybadger.notify(error);
  }
  await notifyAll(code, NotificationTypes.SPACE_DESTROYED);
  return;
};
