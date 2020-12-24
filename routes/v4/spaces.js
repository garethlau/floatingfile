const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");

const multer = require("multer");
const axios = require("axios");

const keys = require("../../config/keys");
const constants = require("../../constants");
const Logger = require("../../services/logger");
const fs = require("fs");
const path = require("path");

const Space = mongoose.model("Space");
const File = mongoose.model("File");
const logger = new Logger(require("path").basename(__filename));
const s3 = require("../../s3");

// create storage object
const storage = multer.memoryStorage({
	destination: (req, file, cb) => {
		cb(null, "");
	},
});

const upload = multer({ storage }).array("files");

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
	} catch (err) {
		return res.status(500).send(err);
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
	} catch (err) {
		return res.status(500).send(err);
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
			s3.deleteObjects(params, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});

		return res.status(200).send();
	} catch (err) {
		console.log(err);
		return res.status(500).send();
	}
});

router.delete("/:code/files/:key", async (req, res) => {
	const { code, key } = req.params;
	const { username } = req.headers;

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
	} catch (error) {}
});

// remove files
router.delete("/:code/files", async (req, res) => {
	const code = req.params.code;

	const toRemove = JSON.parse(req.query.files); // Array of ids for file objects
	let removedFiles = [];
	if (!code) {
		return res.status(422).send();
	}
	const io = req.app.get("socketio");

	try {
		let s3Keys = await Promise.all(
			toRemove.map(
				(metaId) =>
					new Promise(async (resolve, reject) => {
						try {
							// Delete the mongoose object
							let meta = await File.findByIdAndDelete(metaId).exec();

							// Emit socket event to log action
							io.sockets.in(code).emit("FROM_SERVER", {
								type: constants.SOCKET_ACTIONS.FILE_REMOVED,
								payload: meta.filename,
							});

							removedFiles.push(meta.filename);

							let { s3Key } = meta;
							resolve(s3Key);
						} catch (err) {
							console.log(err);
							reject(s3Key);
						}
					})
			)
		);

		let params = {
			Bucket: keys.s3BucketName,
			Delete: {
				Objects: s3Keys.map((s3Key) => {
					return {
						Key: s3Key,
					};
				}),
				Quiet: false,
			},
		};

		await new Promise((resolve, reject) => {
			s3.deleteObjects(params, (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(data);
			});
		});

		let space = await Space.findOne({ code: code });

		space.history.push(
			...removedFiles.map((x) => ({
				action: "REMOVE",
				payload: x,
				author: req.headers["username"],
				timestamp: Date.now(),
			}))
		);

		let remainingFiles = space.files.filter((file) => {
			return !toRemove.includes(String(file._id));
		});
		space.files = remainingFiles;
		await space.save();

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

		return res.status(200).send();
	} catch (err) {
		return res.status(500).send(err);
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

		// Check if the space has reached its max capacity
		if (space.size >= space.capacity) {
			// Space has reached max capacity
			return res.status(403).send({ message: "Max capacity reached." });
		}

		// Generate signed URL for the file
		const params = {
			Key: key,
			Bucket: keys.S3_BUCKET_NAME,
		};
		console.log(params);
		const signedUrl = s3.getSignedUrl("putObject", params);

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

		return res.status(200).send({ message: "File added to space.", signedUrl, space: updatedSpace });
	} catch (error) {
		console.log(error);
		return res.status(500).send(error);
	}
});

router.post("/:code/files", upload, async (req, res) => {
	const code = req.params.code;
	const io = req.app.get("socketio");

	if (!code) {
		return res.status(422).send();
	}
	try {
		let space = await Space.findOne({ code: code }).exec();
		if (!space) {
			return res.status(404).send({ message: "Space does not exist. Files have not been uploaded." });
		}

		// Space exists, create file meta data object and add to space
		// const expiresIn = (space.options ? space.options.fileExpirationTime : 60) * 60 * 1000;
		const expiresIn = 60 * 60 * 1000;
		const deleteAfterDownload = space.options ? space.options.deleteAfterDownload : false;

		// Upload to AWS S3
		const files = req.files;

		let savedFiles = await Promise.all(
			files.map(
				(file) =>
					new Promise((resolve, reject) => {
						const currentDate = new Date().valueOf().toString();
						const random = Math.random().toString();
						const hash = crypto
							.createHash("sha1")
							.update(currentDate + random)
							.digest("hex");
						const ext = file.originalname.split(".")[file.originalname.split(".").length - 1];
						const s3Key = `${hash}.${ext}`;

						let params = {
							ACL: "public-read",
							Bucket: "floatingfile-prod",
							Body: file.buffer,
							Key: s3Key,
						};

						s3.upload(params, async (err, data) => {
							if (err) {
								reject(err);
							} else {
								// Successfully uploaded to AWS
								let fileObj = new File({
									filename: file.originalname,
									size: file.size,
									mimetype: file.mimetype,
									parentId: space._id,
									expires: Date.now() + expiresIn,
									deleteAfterDownload: deleteAfterDownload,
									location: data.Location,
									s3Key: s3Key,
									timestamp: Date.now(),
								});
								try {
									await fileObj.save();
									// Log the upload to the history
									io.sockets.in(code).emit("FROM_SERVER", {
										type: constants.SOCKET_ACTIONS.FILE_UPLOADED,
										payload: fileObj.filename,
									});
									resolve(fileObj);
								} catch (err) {
									reject(err);
								}
							}
						}).on("httpUploadProgress", (event) => {});
					})
			)
		);

		space.history.push(
			...savedFiles.map((file) => ({
				action: "UPLOAD",
				author: req.headers["username"],
				payload: file.filename,
				timestamp: Date.now(),
			}))
		);

		space.files = space.files.concat(savedFiles);

		await space.save();

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

		return res.status(200).send();
	} catch (err) {
		console.log(err.message);
		return res.status(500).send();
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
	} catch (err) {
		console.error(err);
		return res.status(500).send();
	}
});

router.get("/:code/files/zip", async (req, res) => {
	const fileIds = JSON.parse(req.query.files);

	try {
		const currentDate = new Date().valueOf().toString();
		const random = Math.random().toString();
		const folderName = crypto
			.createHash("sha1")
			.update(currentDate + random)
			.digest("hex");

		fs.mkdirSync(path.join(__dirname, "..", "..", "tmp", folderName));
		const files = await Promise.all(
			fileIds.map(
				(id) =>
					new Promise(async (resolve, reject) => {
						try {
							const meta = await File.findById(mongoose.Types.ObjectId(id)).exec();
							const filename = meta.filename;
							const filepath = path.join(__dirname, "..", "..", "tmp", folderName, filename);
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
		return res.status(500).send(err);
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
		return res.status(500).send(error);
	}
});

router.get("/:code/history", async (req, res) => {
	const { code } = req.params;
	try {
		const space = await Space.findOne({ code }).exec();
		const { history } = space;
		return res.status(200).send({ history });
	} catch (err) {
		return res.status(500).send();
	}
});

router.get("/:code/users", async (req, res) => {
	const { code } = req.params;
	try {
		const space = await Space.findOne({ code }).exec();
		const { users } = space;
		return res.status(200).send({ users });
	} catch (err) {
		return res.status(500).send();
	}
});

module.exports = router;
