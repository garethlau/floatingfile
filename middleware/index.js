let keys = ["secretdog", "secretcat"];

module.exports = {
	requireKey: function (req, res, next) {
		if (!req.headers || !req.headers["api-key"]) {
			return res.status(403).send({ message: "Missing API Key." });
		}
		let isValid = false;
		keys.forEach((key) => {
			if (req.headers["api-key"] === key) {
				isValid = true;
				return;
			}
		});
		if (isValid) {
			next();
		} else {
			return res.status(403).send({ message: "Invalid API Key." });
		}
	},
};
