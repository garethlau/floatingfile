const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const zip = require("express-easy-zip");
const Logger = require("./services/logger");
const morgan = require("morgan");
const { PORT, NODE_ENV, MONGO_URI } = require("./config");

const Honeybadger = require("honeybadger").configure({
  apiKey: process.env.HONEYBADGER_API_KEY,
  environment: NODE_ENV,
  developmentEnvironments: ["dev", "development"],
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
app.use(
  morgan(":date[web] :method :url :status - :response-time ms (key: :api-key)")
);

app.use(zip());

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useCreateIndex: true,
    keepAlive: 1,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.success("Successfully connected to mongo.");
  })
  .catch((error) => {
    logger.error("Error connecting to mongo.", error);
    Honeybadger.notify(error);
  });

require("./models");

// Set socket
const server = app.listen(PORT);
const io = require("socket.io")(server);
require("./socket")(app, io);

app.set("socketio", io);

app.use(require("./routes"));

app.get("/*", (req, res, next) => {
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

app.get("/ping", (req, res) => {
  return res.send("pong");
});

if (NODE_ENV === "staging" || NODE_ENV === "beta") {
  console.log("\x1b[34m", "ENVIRONMENT IS " + NODE_ENV, "\x1b[0m");
  console.log("\x1b[34m", "SERVING CLIENT DIRECTORY", "\x1b[0m");
  app.use(express.static(path.join(__dirname, "..", "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.resolve(__dirname, "..", "client", "build", "index.html")
    );
  });
}
