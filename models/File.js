const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema({
	id: Schema.Types.ObjectId,
	parentId: Schema.Types.ObjectId,
	filename: String,
	size: String,
	mimetype: String,
	expires: String,
	location: String,
	s3Key: String,
	deleteAfterDownload: Boolean,
	timestamp: String,
});

module.exports = mongoose.model("File", FileSchema);
