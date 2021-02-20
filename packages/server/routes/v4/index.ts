import express from "express";
import spacesRoutes from "./spaces";
import signedUrls from "./signed-urls";
import subscriptionsRoutes from "./subscriptions";
import nickname from "./nickname";

const router = express.Router();

router.use("/spaces", spacesRoutes);
router.use("/signed-urls", signedUrls);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/nickname", nickname);

export default router;