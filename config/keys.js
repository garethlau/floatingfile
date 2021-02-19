// determine whether we need production or dev keys
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "beta") {
	// in prod
	module.exports = require("./prod");
} else {
	// in dev
	module.exports = require("./dev");
}
