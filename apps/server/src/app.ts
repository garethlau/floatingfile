import express from "express";
import morgan from "morgan";
import rpc from "./rpc";
import router from "./router";
import zip from "express-easy-zip";
import Honeybadger from "./lib/honeybadger";

const app = express();

app.use(Honeybadger.requestHandler);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(zip());
app.use(morgan("tiny"));
app.use("/api/rpc", rpc);
app.use("/api", router);

app.use(Honeybadger.errorHandler);

export default app;
