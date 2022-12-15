import { Router } from "express";
import { generateCode } from "../services/code-service";
import redis from "../lib/redis";

const router = Router();

router.get("/:code", async (req, res) => {
  const code = req.params.code as string;
  const url = await redis.get(code);
  return res.status(200).send({ url });
});

router.post("/", async (req, res) => {
  const { url } = req.body as Record<string, string>;
  const code = await generateCode();

  await redis.set(code, url, { EX: 6 * 60 * 60 });

  return res.status(200).send({ code });
});

export default router;
