const express = require("express");
const router = express.Router();
const chatController = require("../controllers/adchatcontroller");

router.post("/get-or-create-room", chatController.getOrCreateRoom);
router.get("/messages/:room_id", chatController.getMessagesByRoom);

module.exports = router;
