const express = require("express");
const router = express.Router();

router.use("/spaces", require("./spaces"));
router.use("/signed-urls", require("./signed-urls"));
router.use("/subscriptions", require("./subscriptions"));
router.use("/nickname", require("./nickname"));

module.exports = router;
