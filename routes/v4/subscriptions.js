const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { addClient, removeClient, EventTypes, sendToClient } = require("../../services/subscriptionManager");

router.get("/:code", (req, res) => {
	try {
		const { code } = req.params;
		const { username } = req.query;
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
			username,
			res,
		};

		addClient(code, client);
		sendToClient(client, { type: EventTypes.CONNECTION_ESTABLISHED, clientId });

		req.on("close", () => {
			removeClient(code, client);
		});
	} catch (error) {
		console.log(error);
	}
});

module.exports = router;
