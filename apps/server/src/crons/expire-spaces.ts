import prisma from "../lib/prisma";
import add from "date-fns/add";
import logger from "../lib/logger";
import { removeMany } from "../services/files-service";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export const expireSpaces = async () => {
  const spaces = await prisma.space.findMany({ include: { files: true } });

  const expiredSpaces = spaces
    .map((space) => {
      const today = new Date();
      const expires = add(space.createdAt, { hours: 12 });
      if (today > expires) {
        return space;
      }
    })
    .filter(notEmpty);
  const expiredCodes = expiredSpaces.map((space) => space.code);

  const expiredFileIds = expiredSpaces.flatMap((space) => {
    return space.files.map((file) => file.id);
  });

  await removeMany(expiredFileIds);

  const { count } = await prisma.space.deleteMany({
    where: {
      code: {
        in: expiredCodes,
      },
    },
  });

  logger.info(`[Cron]: Deleted ${count} spaces.`);
};
