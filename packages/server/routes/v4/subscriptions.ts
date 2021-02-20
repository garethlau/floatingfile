import express, { Request, Response } from "express";
import crypto from "crypto";
import {
  addClient,
  removeClient,
  EventTypes,
  sendToClient,
} from "../../services/subscriptionManager";

const router = express.Router();

router.get("/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    let username = "";
    if (typeof req.query.username === "string") {
      username = req.query.username;
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
    const client = {
      id: clientId,
      username: username,
      res,
    };

    await addClient(code, client);
    sendToClient(client, { type: EventTypes.CONNECTION_ESTABLISHED, clientId });

    req.on("close", () => {
      removeClient(code, client);
    });
  } catch (error) {
    console.log(error);
  }
});

export default router;
