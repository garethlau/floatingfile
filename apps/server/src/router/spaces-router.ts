import { Router } from "express";
import {
  findSpace,
  destroySpace,
  createSpace,
} from "../controllers/space-controller";

const router = Router();

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const space = await findSpace({ code });
  return res.status(200).send({ space });
});
router.post("/", async (req, res) => {
  const username = req.headers.username;
  const space = await createSpace({ username });
  return res.status(200).send({ space });
});

router.delete("/:code", async (req, res) => {
  const { code } = req.params;
  await destroySpace({ code });
  return res.status(200).send();
});

export default router;
