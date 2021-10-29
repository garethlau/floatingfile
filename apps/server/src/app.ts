import express from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import routes from "./routes";
import Honeybadger from "./utils/honeybadger";
import {
  logErrors,
  clientErrorHandler,
  errorHandler,
} from "./middleware/errorHandler";
import morgan from "morgan";
import zip from "express-easy-zip";

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

app.use(morgan("tiny"));

app.use(zip());

app.use("/api", routes);
app.use(Honeybadger.errorHandler);
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

export default app;
