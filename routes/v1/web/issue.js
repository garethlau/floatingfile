const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Issue = mongoose.model("Issue");

// Create a new issue
router.post("/", async (req, res) => {
	try {
		let { email, message } = req.body;
		let issue = new Issue({
			email: email,
			message: message,
			date: Date.now(),
			status: "",
		});
		await issue.save();
		return res.status(200).send();
	} catch (err) {
		return res.status(500).send();
	}
});

module.exports = router;
