import express from "express";
const router = express.Router();

router.use("/nickname", require("./nickname"));

export default router;
