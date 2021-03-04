import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import path from "path";
require("./models");
import { router } from "./routes";
import logger from "./utils/logger";
import Honeybadger from "./utils/honeybadger";
import {
  logErrors,
  clientErrorHandler,
  errorHandler,
} from "./middleware/errorHandler";
const zip = require("express-easy-zip");
const morgan = require("morgan");
import { PORT, NODE_ENV, MONGO_URI } from "./config";

const app = express();

const whitelist = [
  "http://localhost:3000",
  "https://app.floatingfile.space",
  "https://staging.floatingfile.space",
  "https://beta.floatingfile.space",
];

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
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

morgan.token("api-key", (req: Request) => req.headers["api-key"]);
app.use(
  morgan(":date[web] :method :url :status - :response-time ms (key: :api-key)")
);

app.use(zip());

const mongooseOptions: mongoose.ConnectOptions = {
  useNewUrlParser: true,
  useFindAndModify: true,
  useCreateIndex: true,
  keepAlive: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(MONGO_URI, mongooseOptions)
  .then(() => {
    logger.info("Successfully connected to mongo.");
  })
  .catch((error) => {
    logger.error("Error connecting to mongo.", error);
    Honeybadger.notify(error);
  });

app.use(router);
app.use(Honeybadger.errorHandler);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

app.get("/ping", (req, res) => {
  return res.send("pong");
});

if (NODE_ENV === "staging" || NODE_ENV === "beta") {
  logger.info("ENVIRONMENT IS " + NODE_ENV);
  logger.info("SERVING CLIEN");

  const APP_OUT_DIRECTORY = path.join(__dirname, "..", "..", "client/out");
  const APP_INDEX = path.join(APP_OUT_DIRECTORY, "index.html");

  app.use(express.static(path.join(__dirname, "..", "client", "build")));
  app.use(express.static(APP_OUT_DIRECTORY));
  app.get("*", (_, res: Response) => {
    res.sendFile(APP_INDEX);
  });
}

app.listen(PORT, () => {
  logger.info(`${MONGO_URI} ${NODE_ENV}`);
  logger.info("Listening on PORT: " + PORT);
});
