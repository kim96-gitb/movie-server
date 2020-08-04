const express = require("express");
const auth = require("../middleware/auth");
const {
  signupMovie,
  loginMovie,
  logoutAll,
  Myinfo,
  logout,
  userPhotoUpload,
} = require("../controllers/user");

const router = express.Router();

router.route("/signup").post(signupMovie);
router.route("/login").post(loginMovie);
router.route("/logoutall").delete(auth, logoutAll);
router.route("/logout").delete(auth, logout);
router.route("/me").get(auth, Myinfo);
router.route("/me/photo").put(auth, userPhotoUpload);

module.exports = router;
