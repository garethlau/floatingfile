import express from "express";
import v4Routes from "./v4";
import v3Routes from "./v3";
import v5Routes from "./v5";
export const router = express.Router();
const middlewares = require("../middleware");

let siteAssociation = {
  applinks: {
    apps: [],
    details: [
      {
        appID: "8VU5ULQ45F.com.alanyan.Floating-File",
        paths: [
          "NOT /privacy/*",
          "NOT /terms/*",
          "NOT /donate/*",
          "NOT /support/*",
          "/*",
        ],
      },
    ],
  },
};

router.get("/.well-known/apple-app-site-association", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(siteAssociation));
});

router.get("/apple-app-site-association", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(siteAssociation));
});

router.use("/api/v3", middlewares.requireKey, v3Routes);
router.use("/api/v4", middlewares.requireKey, v4Routes);
router.use("/api/v5", v5Routes);
