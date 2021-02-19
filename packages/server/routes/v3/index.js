const express = require("express");
const router = express.Router();

router.use("/space", require("./space"));
router.use("/nickname", require("./nickname"));

module.exports = router;
