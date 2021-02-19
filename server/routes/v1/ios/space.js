const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const File = mongoose.model("File");
const Space = mongoose.model("Space");
const constants = require("../../../constants");

/**
 * Downloads a file from gfs and saves it as a static file in the server directory
 */

router.get("/:code/file/:fileId", async (req, res) => {
	let code = req.params.code;
	let fileId = req.params.fileid;
	const io = req.app.get("socketio");

	try {
		let file = await File.findById(fileId);
		let space = await Space.findOne({ code: code });

		if (!file) {
			return res.status(404).send({ message: "File does not exist." });
		}
		if (!space) {
			return res.status(404).send({ message: "Space does not exist." });
		}

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILE_DOWNLOADED,
			payload: file.fillename,
		});

		return res.status(200).send({ uri: file.location });
	} catch (err) {
		console.log(err);
		return res.status(500).send();
	}
});

router.get("/:code/file/:fileId/static", (req, res) => {
	let fileId = req.params.fileId;
	const gfs = req.app.get("gfs");
	if (!fileId) {
		return res.status(400).send();
	}
	File.findById(fileId, (err, file) => {
		if (err) {
			return res.status(500).send();
		}
		gfs.findOne(
			{
				_id: mongoose.Types.ObjectId(file.fileId),
				root: "uploads",
			},
			(err, doc) => {
				if (err) {
					return res.status(500).send();
				}
				if (!doc) {
					return res.status(404).send();
				} else {
					// Emit a file-download socket event to everyone in the room
					Space.findById(mongoose.Types.ObjectId(file.parentId), (err, space) => {
						if (err) {
							return res.status(500).send();
						}
						if (!space) {
							return res.status(404).send();
						} else {
							const io = req.app.get("socketio");
							let code = space.code;
							io.sockets.in(code).emit("FROM_SERVER", {
								type: constants.SOCKET_ACTIONS.FILE_DOWNLOADED,
								payload: file.filename,
							});
						}
					});

					// Create the file and statically host it

					const current_date = new Date().valueOf().toString();
					const random = Math.random().toString();
					const hash = crypto
						.createHash("sha1")
						.update(current_date + random)
						.digest("hex");
					const ext = file.filename.split(".")[file.filename.split(".").length - 1];

					const filename = `${hash}.${ext}`;
					const uri = `https://www.floatingfile.space/static/${filename}`;
					const writeStream = fs.createWriteStream(path.join(__dirname, "..", "..", "files", filename));
					const readStream = gfs.createReadStream(doc.filename);
					readStream.pipe(writeStream);
					writeStream.on("finish", () => {
						return res.status(200).send({ uri: uri });
					});
				}
			}
		);
	});
});

/**
 * Deletes a statically hosted file
 */
router.delete("/:code/file/:fileId/static", (req, res) => {
	let uri = req.query.uri;
	let filename = uri.split("/")[uri.split("/").length - 1];
	fs.unlink(path.join(__dirname, "..", "..", "files", filename), (err) => {
		if (err) {
			return res.status(500).send();
		} else {
			return res.status(200).send();
		}
	});
});

module.exports = router;
