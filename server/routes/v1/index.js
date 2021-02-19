const express = require("express");
const router = express.Router();

router.use("/common/space", require("./common/space"));
router.use("/common/question", require("./common/question"));
router.use("/ios/space", require("./ios/space"));
router.use("/web/space", require("./web/space"));
router.use("/web/stripe", require("./web/stripe"));
router.use("/web/issue", require("./web/issue"));

module.exports = router;
