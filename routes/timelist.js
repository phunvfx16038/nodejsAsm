const express = require("express");
const router = express.Router();
const timelistController = require("../controller/timelist");

router.get("/", timelistController.getTimeList);
router.post("/", timelistController.postTimeList);

module.exports = router;
