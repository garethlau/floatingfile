import { Router } from "express";
import v5Routes from "./v5";

const router = Router();

let siteAssociation = {
  applinks: {
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

router.use("/v5", v5Routes);

export default router;
