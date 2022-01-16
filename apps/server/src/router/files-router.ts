import { Router } from "express";
import {
  preupload,
  postupload,
  predownload,
  postdownload,
  removeSingle,
  removeMany,
} from "../controllers/files-controller";

const router = Router();

router.post("/preupload", async (req, res) => {
  const { code, size } = req.body;
  const { signedUrl, key } = await preupload({ code, size });
  return res.status(200).send({ signedUrl, key });
});

router.post("/postupload", async (req, res) => {
  const { code, file } = req.body;
  const username = req.headers.username;
  await postupload({ code, file, username });
  return res.status(200).send();
});

router.post("/predownload", async (req, res) => {
  const { id } = req.body;
  const { signedUrl } = await predownload({ id });
  return res.status(200).send({ signedUrl });
});

router.post("/postdownload", async (req, res) => {
  const username = req.headers.username;
  const { code, name } = req.body;
  await postdownload({ code, username, name });
  return res.status(200).send();
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const username = req.headers.username;
  await removeSingle({ username, id });
  return res.status(200).send();
});

router.delete("/", async (req, res) => {
  const username = req.headers.username;
  let ids;
  if (typeof req.query.ids === "string") {
    ids = JSON.parse(req.query.ids);
  } else {
    // Fail to parse ids to remove
    return res.status(422).send();
  }
  await removeMany({ username, ids });
  return res.status(200).send();
});

export default router;
