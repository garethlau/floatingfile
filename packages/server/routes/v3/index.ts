import express from "express";
import nicknameRoutes from "./nickname";
const router = express.Router();

router.use("/nickname", nicknameRoutes);

export default router;
