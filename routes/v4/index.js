const express = require("express");
const router = express.Router();

router.use("/spaces", require("./spaces"));
router.use("/signed-urls", require("./signed-urls"));

module.exports = router;
