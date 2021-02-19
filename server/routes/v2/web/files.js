const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const Space = mongoose.model("Space");
const File = mongoose.model("File");

router.get("/zip", async (req, res) => {
	const fileIds = JSON.parse(req.query.files);

	try {
		const currentDate = new Date().valueOf().toString();
		const random = Math.random().toString();
		const folderName = crypto
			.createHash("sha1")
			.update(currentDate + random)
			.digest("hex");

		fs.mkdirSync(path.join(__dirname, "..", "..", "..", "tmp", folderName));
		const files = await Promise.all(
			fileIds.map(
				(id) =>
					new Promise(async (resolve, reject) => {
						try {
							const meta = await File.findById(mongoose.Types.ObjectId(id)).exec();
							const filename = meta.filename;
							const filepath = path.join(__dirname, "..", "..", "..", "tmp", folderName, filename);
							const writeStream = fs.createWriteStream(filepath);
							let response = await axios({
								method: "GET",
								url: meta.location,
								responseType: "stream",
							});
							response.data.pipe(writeStream);
							writeStream.on("finish", () => {
								resolve({ path: filepath, name: filename });
							});
						} catch (err) {
							reject(err);
						}
					})
			)
		);

		res.zip({
			files,
			filename: `${folderName}.zip`,
		});
	} catch (err) {
		console.log(err);
	}
});

router.delete("/zip", (req, res) => {
	const { folder } = req.query;
	const hash = folder.split(".")[0];
	setTimeout(() => {
		deleteFolderRecursive(path.join(__dirname, "..", "..", "..", "tmp", hash));
		return res.status(200).send();
	}, 10000);
});

router.get("/:fileId", async (req, res) => {
	const { fileId } = req.params; // ID for Mongoose Schema
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

		space.history.push({
			action: "DOWNLOAD",
			author: req.headers["username"],
			payload: file.filename,
			timestamp: Date.now(),
		});

		await space.save();

		io.sockets.in(space.code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code: space.code,
		});

		return response.data.pipe(res);
	} catch (err) {
		console.log(err);
		return res.status(500).send(err);
	}
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
