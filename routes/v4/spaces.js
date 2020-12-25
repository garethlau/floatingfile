const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const keys = require("../../config/keys");
const constants = require("../../constants");
const fs = require("fs");
const path = require("path");
const Space = mongoose.model("Space");
const File = mongoose.model("File");
const s3 = require("../../s3");
const Honeybadger = require("honeybadger");

// Get a space
router.get("/:code", async (req, res) => {
	const code = req.params.code;
	if (!code) {
		return res.status(400).send({ message: "Invalid request." });
	}
	try {
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space does not exist." });
		} else {
			return res.status(200).send({ space });
		}
	} catch (error) {
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

// Create a new space
router.post("/", async (req, res) => {
	// generate code
	try {
		const buf = crypto.randomBytes(3);
		const code = buf.toString("hex").toUpperCase();

		let expiresIn = (req.body.expiresIn || 180) /* MIN */ * 60 * 1000;
		let space = new Space({
			code: code,
			files: [],
			expires: Date.now() + expiresIn,
			options: req.body.options || {
				fileExpirationTime: 30,
				maxConnections: 5,
				deleteAfterDownload: false,
			},
			history: [],
			users: [],
		});
		const savedSpace = await space.save();
		return res.status(200).send({ space: savedSpace });
	} catch (error) {
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

// Delete a space
router.delete("/:code", async (req, res) => {
	const io = req.app.get("socketio");
	let code = req.params.code;

	if (!code) {
		return res.status(400).send({ message: "Invalid request." });
	}
	try {
		// Delete the space
		let deletedSpace = await Space.findOneAndDelete({ code: code }).exec();
		if (!deletedSpace) {
			return res.status(404).send({ message: "Space does not exist." });
		}

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.CLOSE,
		});

		if (deletedSpace.files.length === 0) {
			return res.status(200).send();
		}

		// Remove file objects
		let spaceId = deletedSpace._id;
		await File.deleteMany({ parentId: spaceId }).exec();

		// Remove files from S3
		let s3Keys = deletedSpace.files.map((file) => file.s3Key);

		let params = {
			Bucket: keys.s3BucketName,
			Delete: {
				Objects: s3Keys.map((s3Key) => {
					return { Key: s3Key };
				}),
				Quiet: false,
			},
		};

		await new Promise((resolve, reject) => {
			s3.deleteObjects(params, (error, data) => {
				if (error) {
					reject(error);
				}
				resolve(data);
			});
		});

		return res.status(200).send();
	} catch (error) {
		console.log(error);
		Honeybadger.notify(error);
		return res.status(500).send();
	}
});
router.delete("/:code/files/:key", async (req, res) => {
	const { code, key } = req.params;
	const { username } = req.headers;
	const io = req.app.get("socketio");

	try {
		// Find the space
		const space = await Space.findOne({ code }).exec();

		// Remove the file from s3
		const params = {
			Key: key,
			Bucket: keys.S3_BUCKET_NAME,
		};
		await s3.deleteObject(params);

		// Remove the file from the space
		const removedFile = space.files.find((file) => file.key === key);
		space.files = space.files.filter((file) => file.key !== key);

		// Adjust the used size of the space
		space.size = space.size - removedFile.size;

		// Update the history of the space
		const historyRecord = {
			action: "REMOVE",
			payload: removedFile.name,
			author: username,
			timestamp: Date.now(),
		};
		space.history = [...space.history, historyRecord];
		const updatedSpace = await space.save();

		// Notify clients that the space has been updated
		io.sockets.in(code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILES_UPDATED,
			payload: code,
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: "SPACE_UPDATED",
			code,
		});

		return res.status(200).send({ space: updatedSpace });
	} catch (error) {
		console.log(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

// Remove multiple files
router.delete("/:code/files", async (req, res) => {
	const { code } = req.params;
	const toRemove = JSON.parse(req.query.toRemove);
	const { username } = req.headers;
	const io = req.app.get("socketio");
	try {
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space does not exist." });
		}

		// Remove objects from s3
		const params = {
			Bucket: "examplebucket",
			Delete: {
				Objects: toRemove.map((key) => ({ Key: key })),
				Quiet: false,
			},
		};

		await s3.deleteObjects(params);

		const files = space.files;

		// Remove files from the space
		space.files = files.filter((file) => !toRemove.includes(file.key));

		// Update the history
		const removedFiles = files.filter((file) => toRemove.includes(file.key));
		const historyRecords = removedFiles.map((file) => ({
			action: "REMOVE",
			payload: file.name,
			author: username,
			timestamp: Date.now(),
		}));

		space.history = [...space.history, ...historyRecords];

		// Save changes
		const updatedSpace = await space.save();

		// Notify clients that the space has been updated
		io.sockets.in(code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILES_UPDATED,
			payload: code,
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: "SPACE_UPDATED",
			code,
		});

		return res.status(200).send({ message: "Files removed.", space: updatedSpace });
	} catch (error) {
		console.error(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

router.patch("/:code/file", async (req, res) => {
	const { code } = req.params;
	const io = req.app.get("socketio");
	const { key, size, name, type, ext } = req.body;
	const { username } = req.headers;

	if (!code) {
		return res.status(422).send({ message: "No code supplied." });
	}
	try {
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space not found." });
		}

		// Attach the file object to the space
		space.files = [...space.files, { key, size, name, type, ext }];

		// Increase used space
		space.size = space.size + size;

		// Record this upload in the history
		space.history = [...space.history, { action: "UPLOAD", author: username, payload: name, timestamp: Date.now() }];

		// Notify clients of changes
		io.sockets.in(code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILES_UPDATED,
			payload: code,
			code,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: "SPACE_UPDATED",
			code,
		});

		const updatedSpace = await space.save();

		return res.status(200).send({ message: "File added to space.", space: updatedSpace });
	} catch (error) {
		console.log(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

router.get("/:code/files", async (req, res) => {
	const { code } = req.params;
	try {
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space not found." });
		}

		const files = space.files.map((file) => {
			const params = {
				Key: file.key,
				Bucket: keys.S3_BUCKET_NAME,
			};
			const signedUrl = s3.getSignedUrl("getObject", params);
			file.signedUrl = signedUrl;
			return file;
		});

		return res.status(200).send({ files });
	} catch (error) {
		console.error(error);
		Honeybadger.notify(error);
		return res.status(500).send();
	}
});

router.get("/:code/files/zip", async (req, res) => {
	const { code } = req.params;
	const s3Keys = JSON.parse(req.query.keys);

	try {
		// Find the space
		const space = await Space.findOne({ code }).exec();

		// Get the file objects to zip
		const files = space.files.filter((file) => s3Keys.includes(file.key));

		// Create a hash as the folder name
		const currentDate = new Date().valueOf().toString();
		fs.mkdirSync(path.join(__dirname, "..", "..", "tmp"));
		const random = Math.random().toString();
		const folderName = crypto
			.createHash("sha1")
			.update(currentDate + random)
			.digest("hex");
		fs.mkdirSync(path.join(__dirname, "..", "..", "tmp", folderName));

		// Download each file from s3
		const promises = files.map(
			(file) =>
				new Promise((resolve, reject) => {
					const params = {
						Key: file.key,
						Bucket: keys.S3_BUCKET_NAME,
					};
					const filepath = path.join(__dirname, "..", "..", "tmp", folderName, file.name);
					const fileStream = fs.createWriteStream(filepath);
					const s3Stream = s3.getObject(params).createReadStream();
					s3Stream.on("error", (error) => {
						reject(error);
					});

					s3Stream
						.pipe(fileStream)
						.on("error", (error) => {
							reject(error);
						})
						.on("close", () => {
							resolve({ path: filepath, name: file.name });
						});
				})
		);
		const values = await Promise.all(promises);
		// TODO Add zip action to space history
		return res.zip({ files: values, filename: `${folderName}.zip` });
	} catch (error) {
		console.error(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

router.delete("/:code/files/zip", (req, res) => {
	const { folder } = req.query;
	const hash = folder.split(".")[0];
	setTimeout(() => {
		deleteFolderRecursive(path.join(__dirname, "..", "..", "tmp", hash));
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

router.patch("/:code/history", async (req, res) => {
	const { code } = req.params;
	const { action, payload } = req.body;
	const { username } = req.headers;
	const io = req.app.get("socketio");

	try {
		const space = await Space.findOne({ code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space not found." });
		}

		if (action === "DOWNLOAD_FILE") {
			const downloadedFile = space.files.find((file) => file.key === payload);
			space.history = [
				...space.history,
				{ action: "DOWNLOAD", author: username, payload: downloadedFile.name, timestamp: Date.now() },
			];
		}

		const updatedSpace = await space.save();

		io.sockets.in(code).emit("FROM_SERVER", {
			type: "HISTORY_UPDATED",
			code,
		});

		return res.status(200).send({ message: "History updated.", space: updatedSpace });
	} catch (error) {
		console.error(error);
		Honeybadger.notify(error);
		return res.status(500).send(error);
	}
});

router.get("/:code/history", async (req, res) => {
	const { code } = req.params;
	try {
		const space = await Space.findOne({ code }).exec();
		const { history } = space;
		return res.status(200).send({ history });
	} catch (error) {
		return res.status(500).send();
	}
});

router.get("/:code/users", async (req, res) => {
	const { code } = req.params;
	try {
		const space = await Space.findOne({ code }).exec();
		const { users } = space;
		return res.status(200).send({ users });
	} catch (error) {
		Honeybadger.notify(error);
		return res.status(500).send();
	}
});

module.exports = router;
