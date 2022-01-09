import { Router } from "express";

import {
  createSpace,
  findSpace,
  destroySpace,
} from "./controllers/space-controller";
export { createSpace, destroySpace, findSpace };

import {
  preupload,
  postupload,
  predownload,
  postdownload,
  remove,
  removeMany,
} from "./controllers/files-controller";
export {
  preupload,
  postupload,
  predownload,
  postdownload,
  remove as removeFile,
  removeMany as removeFiles,
};

import { generateUsername } from "./controllers/username-controller";
export { generateUsername };

const router = Router();

type Payload = {
  endpoint: string;
  params: any[];
};

router.post("/", async (req, res) => {
  const reply = (data?: any) => res.status(200).send(data);

  const payload: Payload = req.body;
  const params = payload.params[0];

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
    case "preupload": {
      const result = await preupload(params);
      return reply(result);
    }
    case "postupload": {
      const result = await postupload(params);
      return reply(result);
    }
    case "predownload": {
      const result = await predownload(params);
      return reply(result);
    }
    case "postdownload": {
      const result = await postdownload(params);
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
    default: {
      return res.status(404).send();
    }
  }
});

export default router;
