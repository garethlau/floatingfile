const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Question = mongoose.model("Question");

router.post("/", async (req, res) => {
	let { email, question } = req.body;
	if (!email || !question) {
		return res.status(422).send();
	}
	try {
		let q = new Question({
			email: email,
			text: question,
			date: Date.now(),
		});
		await q.save();
		return res.status(200).send();
	} catch (err) {
		console.log(err);
		return res.status(500).send();
	}
});

module.exports = router;
