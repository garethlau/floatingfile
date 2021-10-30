import express from "express";
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

app.use(Honeybadger.requestHandler);

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
