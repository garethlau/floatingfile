import crypto from "crypto";
import { S3_BUCKET_NAME } from "../config";
import s3 from "../lib/s3";
import prisma from "../lib/prisma";
import { deletePreviews } from "./image-preview-service";

export const create = async () => {
  const buf = crypto.randomBytes(3);
  const code = buf.toString("hex").toUpperCase();
  const space = await prisma.space.create({
    data: {
      code,
    },
    include: {
      files: true,
      events: true,
    },
  });
  return space;
};

export const find = async (code: string) => {
  const space = await prisma.space.findUnique({
    where: { code },
    include: {
      files: true,
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
      clients: true,
    },
  });
  if (!space) return null;
  return space;
};

export const remove = async (code: string) => {
  const space = await prisma.space.delete({
    where: { code },
    include: { files: true },
  });

  // Remove files from S3
  const keys = space.files.map(({ key }) => key);
  if (keys.length === 0) return;
  const params = {
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
      Quiet: false,
    },
  };
  await s3.deleteObjects(params).promise();
  await deletePreviews(keys);
};
