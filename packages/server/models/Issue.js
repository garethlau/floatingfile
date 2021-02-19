const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
	email: String,
	message: String,
	date: String,
	status: String,
});

module.exports = mongoose.model("Issue", IssueSchema);
