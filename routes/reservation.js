const express = require("express");
const auth = require("../middleware/auth");
const {
  reservationMovie,
  myReservation,
  selectReservation,
  deleteReservation,
} = require("../controllers/reservation");

const router = express.Router();

router.route("/").post(auth, reservationMovie).get(auth, selectReservation);
router.route("/my").get(auth, myReservation);
router.route("/:reservation_id").delete(auth, deleteReservation);
module.exports = router;
