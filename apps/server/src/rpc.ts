import { Router } from "express";
import {
  createSpace,
  findSpace,
  destroySpace,
} from "./controllers/space-controller";
import {
  preUpload,
  postUpload,
  preDownload,
  postDownload,
  remove,
  removeMany,
  initChunkUpload,
  abortChunkUpload,
  completeChunkUpload,
} from "./controllers/files-controller";
import { generateUsername } from "./controllers/username-controller";
import logger from "./lib/logger";

const router = Router();

type Payload = {
  endpoint: string;
  params: any[];
};

router.post("/", async (req, res) => {
  const reply = (data?: any) => res.status(200).send(data);

  const payload: Payload = req.body;
  const params = payload.params[0];
  logger.info(`Invoking RPC: ${payload.endpoint}`);

  switch (payload.endpoint) {
    case "generateUsername": {
      const username = generateUsername();
      return reply(username);
    }
    case "findSpace": {
      const space = await findSpace(params);
      return reply(space);
    }
    case "destroySpace": {
      await destroySpace(params);
      return reply();
    }
    case "createSpace": {
      const space = await createSpace(params);
      return reply(space);
    }
    case "preUpload": {
      const result = await preUpload(params);
      return reply(result);
    }
    case "postUpload": {
      const result = await postUpload(params);
      return reply(result);
    }
    case "preDownload": {
      const result = await preDownload(params);
      return reply(result);
    }
    case "postDownload": {
      const result = await postDownload(params);
      return reply(result);
    }
    case "removeFile": {
      await remove(params);
      return reply();
    }
    case "removeFiles": {
      await removeMany(params);
      return reply();
    }
    case "initChunkUpload": {
      const result = await initChunkUpload(params);
      return reply(result);
    }
    case "abortChunkUpload": {
      const result = await abortChunkUpload(params);
      return reply(result);
    }
    case "completeChunkUpload": {
      const result = await completeChunkUpload(params);
      return reply(result);
    }
    default: {
      return res.status(404).send();
    }
  }
});

export default router;
