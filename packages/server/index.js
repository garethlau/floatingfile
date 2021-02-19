const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const zip = require("express-easy-zip");
const morgan = require("morgan");
const { PORT, NODE_ENV, MONGO_URI } = require("./config");
const logger = require("./utils/logger");
const Honeybadger = require("./utils/honeybadger");

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
    logger.info("Successfully connected to mongo.");
  })
  .catch((error) => {
    logger.error("Error connecting to mongo.", error);
    Honeybadger.notify(error);
  });

require("./models");

app.use(require("./routes"));

app.get("/ping", (req, res) => {
  return res.send("pong");
});

if (NODE_ENV === "staging" || NODE_ENV === "beta") {
  logger.info("ENVIRONMENT IS " + NODE_ENV);
  logger.info("SERVING CLIEN");

  const APP_OUT_DIRECTORY = path.join(__dirname, "packages/client/out");
  const APP_INDEX = path.join(APP_OUT_DIRECTORY, "index.html");

  app.use(express.static(path.join(__dirname, "..", "client", "build")));
  app.use(express.static(APP_OUT_DIRECTORY));
  app.get("*", (req, res) => {
    res.sendFile(APP_INDEX);
  });
}

app.listen(PORT, () => {
  logger.info("Listening on PORT: " + PORT);
});
