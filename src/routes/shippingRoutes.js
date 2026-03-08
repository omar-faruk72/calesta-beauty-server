const express = require("express");
const router = express.Router();
const { createShipping, getAllShippings, getMyOrders } = require("../controllers/shippingController");

router.post("/create", createShipping);
router.get("/all", getAllShippings);
router.get("/my-orders/:email", getMyOrders);

module.exports = router;