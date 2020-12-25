const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const zip = require("express-easy-zip");
const favicon = require("serve-favicon");
const keys = require("./config/keys");
const Logger = require("./services/logger");
const morgan = require("morgan");

const environment = process.env.NODE_ENV || "dev";
const PORT = process.env.PORT || 5000;

const Honeybadger = require("honeybadger").configure({
	apiKey: "c0e13445",
	environment: environment,
	developmentEnvironments: ["dev", "development", "staging"],
});

const logger = new Logger(require("path").basename(__filename));

const app = express();

const whitelist = [
	"http://localhost:3000",
	"https://app.floatingfile.space",
	"https://staging.floatingfile.space",
	"https://beta.floatingfile.space",
];

const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error(`Origin '${origin}' not allowed by cors`));
		}
	},
	credentials: true,
	exposedHeaders: ["Content-Disposition"],
};
app.use(Honeybadger.requestHandler);
app.use(cors(corsOptions));

app.use(favicon(path.join(__dirname, "..", "client", "public", "favicon.ico")));

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(
	bodyParser.json({
		limit: "500mb",
	})
);

morgan.token("api-key", (req) => req.headers["api-key"]);
app.use(morgan(":date[web] :method :url :status - :response-time ms (key: :api-key)"));

app.use(zip());

mongoose
	.connect(keys.MONGO_URI, {
		useNewUrlParser: true,
		useFindAndModify: true,
		useCreateIndex: true,
		keepAlive: 1,
		useUnifiedTopology: true,
	})
	.then(() => {
		logger.success("Successfully connected to mongo.");
	})
	.catch((err) => {
		logger.error("Error connecting to mongo.", err);
	});

require("./models");

// Set socket
const server = app.listen(PORT);
const io = require("socket.io")(server);
require("./socket")(app, io);
require("./services/flush")(io);

app.set("socketio", io);
app.use("/static", express.static("../client/build/static"));

app.use(require("./routes"));

app.get("/*", (req, res, next) => {
	res.setHeader("Last-Modified", new Date().toUTCString());
	next();
});

app.get("/ping", (req, res) => {
	return res.send("pong");
});

if (environment === "staging" || environment === "beta") {
	console.log("\x1b[34m", "ENVIRONMENT IS " + environment, "\x1b[0m");
	console.log("\x1b[34m", "SERVING CLIENT DIRECTORY", "\x1b[0m");
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "..", "client", "build", "index.html"));
	});
}
