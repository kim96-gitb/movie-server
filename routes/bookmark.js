const express = require("express");
const {
  addFavorite,
  selectFavorite,
  deleteFavorite,
} = require("../controllers/bookmark");
const auth = require("../middleware/auth");
const router = express.Router();

router
  .route("/")
  .post(auth, addFavorite)
  .get(auth, selectFavorite)
  .delete(auth, deleteFavorite);

module.exports = router;
