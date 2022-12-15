import { Router } from "express";
import { generateCode } from "../services/code-service";
import redis from "../lib/redis";
import logger from "../lib/logger";

const router = Router();

router.get("/:code", async (req, res) => {
  try {
    const code = req.params.code as string;
    const url = await redis.get(code);
    return res.status(200).send({ url });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    return res.status(505).send();
  }
});

router.post("/", async (req, res) => {
  try {
    const { url } = req.body as Record<string, string>;
    const code = await generateCode();

    await redis.set(code, url, { EX: 6 * 60 * 60 });

    return res.status(200).send({ code });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.stack);
    }
    return res.status(505).send();
  }
});

export default router;
