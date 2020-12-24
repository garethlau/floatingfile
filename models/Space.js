const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {
// 	action: {
// 		type: String,
// 		enum: ["UPLOAD", "DOWNLOAD", "TIMEOUT", "REMOVE", "JOIN", "LEAVE"],
// 	},
// 	author: String,
// 	payload: String,
// },
const SpaceSchema = new Schema(
	{
		code: String,
		files: Array,
		options: Object,
		expires: String,
		history: Array,
		users: Array,
		size: {
			type: Number,
			default: 0,
		},
		capacity: {
			type: Number,
			default: 1073741824,
		},
	},
	{
		timestamps: {
			createdAt: "created_at",
			updatedAt: "updated_at",
		},
	}
);

module.exports = mongoose.model("Space", SpaceSchema);
