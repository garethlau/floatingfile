const express = require("express");
const router = express.Router();
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

router.use("/api/v3", middlewares.requireKey, require("./v3"));

module.exports = router;
