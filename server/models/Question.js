const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
	email: String,
	text: String,
	date: String,
});

module.exports = mongoose.model("Question", QuestionSchema);