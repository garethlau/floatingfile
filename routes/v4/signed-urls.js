const express = require("express");
const router = express.Router();
const s3 = require("../../s3");
const mongoose = require("mongoose");
const Space = mongoose.model("Space");
const keys = require("../../config/keys");
const Honeybadger = require("honeybadger");

router.post("/", async (req, res) => {
	const { file, code } = req.body;
	console.log(code, file);

	try {
		// Check if the space has capacity for this file
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space does not exist." });
		}

		if (space.size + file.size >= space.capacity) {
			// Space has reached max storage capacity
			return res.status(403).send({ message: "Max capacity reached." });
		}

		// Generate signed URL
		const params = {
			Key: file.key,
			Bucket: keys.S3_BUCKET_NAME,
		};
		const signedUrl = s3.getSignedUrl("putObject", params);

		return res.status(200).send({ signedUrl });
	} catch (error) {
		console.error(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

module.exports = router;
