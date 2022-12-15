import { Router } from "express";
import notificationsRouter from "./notifications-router";
import zipRouter from "./zip-router";
import filesRouter from "./files-router";
import spacesRouter from "./spaces-router";
import tunnelsRouter from "./tunnels-router";

const router = Router();

router.use("/zip", zipRouter);
router.use("/notifications", notificationsRouter);
router.use("/files", filesRouter);
router.use("/spaces", spacesRouter);
router.use("/tunnels", tunnelsRouter);

export default router;
