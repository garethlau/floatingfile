const express = require("express");
const router = express.Router();

router.use("/spaces", require("./spaces"));

module.exports = router;
