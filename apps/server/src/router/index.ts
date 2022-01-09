import { Router } from "express";
import notificationsRouter from "./notifications-router";
import zipRouter from "./zip-router";

const router = Router();

router.use("/zip", zipRouter);
router.use("/notifications", notificationsRouter);

export default router;
