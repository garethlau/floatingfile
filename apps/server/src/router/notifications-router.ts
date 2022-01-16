import { EventType, NotificationTypes } from "@floatingfile/types";
import express from "express";
import crypto from "crypto";
import {
  addClient,
  removeClient,
  sendToClient,
  notifyAll,
} from "../services/notification-service";
import cors from "cors";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/:code", cors(), async (req, res, done) => {
  try {
    const { code } = req.params;
    let username = "";
    if (typeof req.query.username === "string") {
      username = req.query.username;
    }

    if (!(await prisma.space.findUnique({ where: { code } }))) {
      return res.status(404).send();
    }

    // Haders and http status to keep connection open
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // https://serverfault.com/questions/801628/for-server-sent-events-sse-what-nginx-proxy-configuration-is-appropriate
    };
    res.writeHead(200, headers);

    const clientId = crypto.randomBytes(256).toString("hex");
    const connection = {
      id: clientId,
      username,
      res,
    };

    await addClient(code, connection);
    await prisma.event.create({
      data: {
        author: username,
        action: EventType.JOIN,
        belongsTo: code,
      },
    });

    sendToClient(clientId, {
      type: NotificationTypes.CONNECTION_ESTABLISHED,
      clientId,
    });

    req.on("close", async () => {
      if (await prisma.space.findUnique({ where: { code } })) {
        removeClient(code, connection);
        await prisma.event.create({
          data: {
            author: username,
            action: EventType.LEAVE,
            belongsTo: code,
          },
        });
        notifyAll(code, NotificationTypes.SPACE_UPDATED);
      }
    });
  } catch (error) {
    done(error);
  }
});

export default router;
