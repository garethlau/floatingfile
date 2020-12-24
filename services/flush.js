const mongoose = require("mongoose");
const File = mongoose.model("File");
const Space = mongoose.model("Space");

const FLUSHING = true;
const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_SECONDS = 10 * 1000;
const FLUSH_INTERVAL =
	process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" ? FIVE_MINUTES : TEN_SECONDS;

const AWS = require("aws-sdk");
const keys = require("../config/keys");
const Logger = require("./logger");
const logger = new Logger(require("path").basename(__filename));

const constants = require("../constants");

const flatten = (arr) => {
	let result = [];
	arr.forEach(function (v) {
		if (Array.isArray(v)) {
			result = result.concat(flatten(v));
		} else {
			result.push(v);
		}
	});
	return result;
};

const flush = (io) => {
	async function flushFiles() {
		try {
			let spaces = await Space.find({}).exec();
			if (!spaces || spaces.length === 0) {
				logger.log("There are no spaces.");
				return;
			}
			let nestedFilesToRemove = await Promise.all(
				spaces.map((space) => {
					return new Promise(async (resolve, reject) => {
						if (space.expires < Date.now()) {
							// Space is expired, remove all files
							try {
								let toDelete = space.files;
								await space.delete();
								resolve(toDelete);
							} catch (err) {
								reject(err);
							}
						} else {
							// Check for any expired files
							let expiredInSpace = space.files.filter((file) => {
								if (file.expires < Date.now()) {
									return file;
								}
							});

							if (expiredInSpace.length === 0) {
								// No expired files
								resolve([]);
							} else {
								// Remove expired files from the space object
								space.files = space.files.filter((file) => {
									return !expiredInSpace.includes(file);
								});

								// Log expired fileso
								space.history.push(
									...expiredInSpace.map((file) => ({
										action: "EXPIRED",
										payload: file.filename,
										timestamp: Date.now(),
									}))
								);

								try {
									let savedSpace = await space.save();
									// Files have been expired, tell client to refresh
									io.sockets.in(savedSpace.code).emit("FROM_SERVER", {
										type: constants.SOCKET_ACTIONS.FILES_UPDATED,
										code: savedSpace.code,
									});
									// History updated, tell client to refresh
									io.sockets.in(savedSpace.code).emit("FROM_SERVER", {
										type: "HISTORY_UPDATED",
										code: savedSpace.code,
									});

									resolve(expiredInSpace);
								} catch (err) {
									reject(err);
								}
							}
						}
					});
				})
			);
			let filesToRemove = flatten(nestedFilesToRemove);
			if (filesToRemove.length === 0) {
				logger.log("No files need to be removed.");
				return;
			}
			let fileIdsToRemove = filesToRemove.map((file) => file._id);
			let s3KeysToRemove = filesToRemove.map((file) => {
				return { Key: file.s3Key };
			});

			let s3bucket = new AWS.S3({
				accessKeyId: keys.s3AccessKeyId,
				secretAccessKey: keys.s3AccessKeySecret,
				Bucket: keys.s3BucketName,
			});

			let params = {
				Bucket: keys.s3BucketName,
				Delete: {
					Objects: s3KeysToRemove,
					Quiet: false,
				},
			};

			await File.deleteMany({ id: { $in: fileIdsToRemove } }).exec();

			await new Promise((resolve, reject) => {
				s3bucket.deleteObjects(params, (err, data) => {
					if (err) {
						console.log(err);
						reject(err);
					}
					resolve(data);
				});
			});
		} catch (err) {
			console.log(err);
		}
	}

	if (FLUSHING) {
		setInterval(() => {
			flushFiles();
		}, FLUSH_INTERVAL);
	} else {
		flushFiles();
	}
};

module.exports = flush;
