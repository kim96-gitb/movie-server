const express = require("express");
const auth = require("../middleware/auth");
const {
  userReply,
  getReply,
  updateReply,
  deleteReply,
} = require("../controllers/reply");

const router = express.Router();

router.route("/").post(auth, userReply).get(getReply);
router.route("/update").put(auth, updateReply);
router.route("/delete").delete(auth, deleteReply);

module.exports = router;
