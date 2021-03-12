import express from "express";
import spacesRoutes from "./spaces";
import signedUrls from "./signed-urls";
import subscriptionsRoutes from "./subscriptions";
import nickname from "./nickname";
import { requireKey } from "../../middleware";

const router = express.Router();

router.use("/spaces", requireKey, spacesRoutes);
router.use("/signed-urls", requireKey, signedUrls);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/nickname", requireKey, nickname);

export default router;
