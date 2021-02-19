const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const AWS = require("aws-sdk");
const multer = require("multer");

const keys = require("../../../config/keys");
const constants = require("../../../constants");
const Logger = require("../../../services/logger");

const Space = mongoose.model("Space");
const File = mongoose.model("File");
const logger = new Logger(require("path").basename(__filename));

// create storage object
const storage = multer.memoryStorage({
	destination: (req, file, cb) => {
		cb(null, "");
	},
});

const upload = multer({ storage }).array("files");

// Get a space
router.get("/:code", (req, res) => {
	let code = req.params.code;
	if (!code) {
		return res.status(400).send({ message: "Invalid request." });
	}
	Space.findOne({ code: code }, (err, space) => {
		if (err) {
			return res.status(500).send({ message: "There was an error.", err: err });
		}
		if (!space) {
			return res.status(404).send({ message: `Did not find space with id ${code}` });
		}
		return res.status(200).send({ message: "Space found.", space: space });
	});
});

// Create a new space
router.post("/", (req, res) => {
	// generate code
	crypto.randomBytes(3, (err, buf) => {
		if (err) return res.status(500).send({ message: "There was an error.", err: err });
		const code = buf.toString("hex");

		let expiresIn = (req.body.expiresIn || 60) /* MIN */ * 60 * 1000;
		// create new space
		let space = new Space({
			code: code,
			files: [],
			expires: Date.now() + expiresIn,
			options: req.body.options || {
				fileExpirationTime: 30,
				maxConnections: 5,
				deleteAfterDownload: false,
			},
		});
		space
			.save()
			.then((savedSpace) => {
				logger.log(`New space created with code: ${savedSpace.code}`);
				return res.status(200).send({ message: "New space created.", space: savedSpace });
			})
			.catch((err) => {
				logger.error("There was an error creating a new space.");
				return res.status(500).send({ message: "There was an error.", err: err });
			});
	});
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
		let s3bucket = new AWS.S3({
			accessKeyId: keys.s3AccessKeyId,
			secretAccessKey: keys.s3AccessKeySecret,
			Bucket: keys.s3BucketName,
		});

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
			s3bucket.deleteObjects(params, (err, data) => {
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

// Get the meta data (File mongoose schema)
router.get("/:code/file/:fileId/meta", (req, res) => {
	let fileId = req.params.fileId;
	if (!fileId) {
		return res.status(400).send();
	}
	File.findById(fileId)
		.then((doc) => {
			if (!doc) {
				return res.status(404).send();
			}
			return res.status(200).send({ message: "Found file.", file: doc });
		})
		.catch((err) => {
			return res.status(500).send();
		});
});

// remove files
router.delete("/:code/file", async (req, res) => {
	const code = req.params.code;

	const toRemove = JSON.parse(req.query.toRemove); // Array of ids for file objects
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

							let { s3Key } = meta;
							resolve(s3Key);
						} catch (err) {
							console.log(err);
							reject(s3Key);
						}
					})
			)
		);

		let s3bucket = new AWS.S3({
			accessKeyId: keys.s3AccessKeyId,
			secretAccessKey: keys.s3AccessKeySecret,
			Bucket: keys.s3BucketName,
		});

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
			s3bucket.deleteObjects(params, (err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				}
				resolve(data);
			});
		});

		let space = await Space.findOne({ code: code });

		let remainingFiles = space.files.filter((file) => {
			return !toRemove.includes(String(file._id));
		});
		space.files = remainingFiles;
		await space.save();

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILES_UPDATED,
			payload: code,
		});
		return res.status(200).send();
	} catch (err) {
		console.log(err);
		return res.status(500).send();
	}
});

router.post("/:code/file", upload, async (req, res) => {
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
		const expiresIn = (space.options ? space.options.fileExpirationTime : 10) * 60 * 1000;
		const deleteAfterDownload = space.options ? space.options.deleteAfterDownload : false;

		// Upload to AWS S3
		const files = req.files;
		let s3bucket = new AWS.S3({
			accessKeyId: keys.s3AccessKeyId,
			secretAccessKey: keys.s3AccessKeySecret,
			Bucket: keys.s3BucketName,
		});

		const currentDate = new Date().valueOf().toString();
		let random = Math.random().toString();
		let batchId = crypto
			.createHash("sha1")
			.update(currentDate + random)
			.digest("hex");

		let savedFiles = await Promise.all(
			files.map(
				(file) =>
					new Promise((resolve, reject) => {
						const currentDate = new Date().valueOf().toString();
						random = Math.random().toString();
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

						io.sockets.in(code).emit("FROM_SERVER", {
							type: constants.SOCKET_ACTIONS.UPLOAD_PROGRESS,
							payload: {
								key: s3Key,
								loaded: 0,
								total: file.size,
								filename: file.originalname,
								ext: ext,
								batchId: batchId,
							},
						});

						s3bucket
							.upload(params, async (err, data) => {
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
							})
							.on("httpUploadProgress", (event) => {
								// Emit progres event
								io.sockets.in(code).emit("FROM_SERVER", {
									type: constants.SOCKET_ACTIONS.UPLOAD_PROGRESS,
									payload: {
										key: s3Key,
										loaded: event.loaded,
										total: event.total,
										filename: file.originalname,
										ext: ext,
										batchId: batchId,
									},
								});
							});
					})
			)
		);

		space.files = space.files.concat(savedFiles);
		await space.save();
		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.UPLOAD_BATCH_COMPLETE,
			payload: batchId,
		});

		io.sockets.in(code).emit("FROM_SERVER", {
			type: constants.SOCKET_ACTIONS.FILES_UPDATED,
			payload: code,
		});

		return res.status(200).send();
	} catch (err) {
		console.log(err.message);
		return res.status(500).send();
	}
});

router.put("/:code/options", (req, res) => {
	let code = req.params.code;
	const io = req.app.get("socketio");
	let options = req.body.options;
	if (!code) return res.status(400).send();

	Space.findOne({ code: code }, (err, space) => {
		if (err) return res.status(500).send();
		if (!space) return res.status(404).send();
		space.options = options;
		space
			.save()
			.then((savedSpace) => {
				io.sockets.in(code).emit("FROM_SERVER", {
					type: constants.SOCKET_ACTIONS.OPTIONS_UPDATED,
				});
				return res.status(200).send({ message: "Options saved.", space: savedSpace });
			})
			.catch((err) => {
				logger.error(`Error updating space (${code})`);
				return res.status(500).send();
			});
	});
});

module.exports = router;
