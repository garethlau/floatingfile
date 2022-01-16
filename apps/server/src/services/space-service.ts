import crypto from "crypto";
import { S3_BUCKET_NAME } from "../config";
import s3 from "../lib/s3";
import prisma from "../lib/prisma";
import { deletePreviews } from "./image-preview-service";

export const create = async () => {
  let code: string | null = null;
  while (!code) {
    const buf = crypto.randomBytes(3);
    const candidate = buf.toString("hex").toUpperCase();
    if (candidate.includes("0") || candidate.includes("O")) {
      continue;
    }
    if (await prisma.space.findUnique({ where: { code: candidate } })) {
      continue;
    }
    code = candidate;
  }

  const space = await prisma.space.create({
    data: {
      code,
    },
  });
  return space;
};

export const find = async (code: string) => {
  if (!code) return null;
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
