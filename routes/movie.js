const express = require("express");

const {
  AllMovie,
  searchMovie,
  yearupMovie,
  yeardownMovie,
  attupMovie,
  attdownMovie,
} = require("../controllers/movie");

const router = express.Router();

router.route("/").get(AllMovie).get(searchMovie);
router.route("/desc").get(yeardownMovie);
router.route("/asc").get(yearupMovie);
router.route("/descper").get(attdownMovie);
router.route("/ascper").get(attupMovie);

module.exports = router;
