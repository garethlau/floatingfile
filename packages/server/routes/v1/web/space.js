const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");

const Logger = require("../../../services/logger");
const constants = require("../../../constants");

const Space = mongoose.model("Space");
const File = mongoose.model("File");
const logger = new Logger(require("path").basename(__filename));

router.get("/:code/zip", async (req, res) => {
	const code = req.params.code;
	if (!code) {
		return res.status(400).send();
	}

	try {
		let space = await Space.findOne({ code: code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space does not exist." });
		}
		let fileObjIds = space.files.map((file) => file._id);

		let currentDate = new Date().valueOf().toString();
		const random = Math.random().toString();
		const folderName = crypto
			.createHash("sha1")
			.update(currentDate + random)
			.digest("hex");

		fs.mkdirSync(path.join(__dirname, "..", "..", "files", folderName));
		let files = await Promise.all(
			fileObjIds.map(
				(id) =>
					new Promise(async (resolve, reject) => {
						try {
							let meta = await File.findById(id);
							console.log(meta)
							const filename = meta.filename;
							const filepath = path.join(__dirname, "..", "..", "files", folderName, filename);
							const writeStream = fs.createWriteStream(filepath);
							let response = await axios({
								method: "GET",
								url: meta.location,
								responseType: "stream",
							});
							response.data.pipe(writeStream);
							writeStream.on("finish", () => {
								resolve({
									path: filepath,
									name: filename,
								});
							});
						} catch (err) {
							reject(err);
						}
					})
			)
		);
		return res.zip(files, `${folderName}.zip`);
	} catch (err) {
		console.log(err);
	}
});
router.get("/:code/file/:fileId", async (req, res) => {
	let fileId = req.params.fileId; // ID for Mongoose Schema
	const io = req.app.get("socketio");
	if (!fileId) {
		return res.status(400).send({ message: "Invalid request." });
	}

	try {
		let file = await File.findById(fileId).exec();
		if (!file) {
			return res.status(404).send({ message: "File not found." });
		}
		res.set("Content-Type", file.mimetype);
		res.set("Content-Disposition", 'attachment; filename="' + file.filename + '"');
		res.set("Content-Length", file.size);
		let response = await axios({
			method: "GET",
			url: file.location,
			responseType: "stream",
		});

		let space = await Space.findById(mongoose.Types.ObjectId(file.parentId)).exec();
		if (!space) {
			// Space does not exist
			return res.status(404).send();
		}
		io.sockets.in(space.code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILE_DOWNLOADED,
			payload: file.filename,
		});

		return response.data.pipe(res);
	} catch (err) {
		console.log(err);
		return res.status(500).send(err);
	}
});

router.delete("/:code/zip", (req, res) => {
	let folder = req.query.folder;
	let hash = folder.split(".")[0];
	setTimeout(() => {
		deleteFolderRecursive(path.join(__dirname, "..", "..", "files", hash));
		return res.status(200).send();
	}, 10000);
});

const deleteFolderRecursive = function (path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			let curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				// recurse
				deleteFolderRecursive(curPath);
			} else {
				// delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
};

module.exports = router;
