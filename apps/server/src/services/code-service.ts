import prisma from "../lib/prisma";
import crypto from "crypto";

export async function generateCode() {
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
    return code;
  }
}
