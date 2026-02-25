const express = require("express");
const orderController = require("../controller/order.controller");
const { isValidUser } = require("../middleware/verifyJWT");

const router = express.Router();

router.post("/create", isValidUser, orderController.createOrder);
router.post("/verify", isValidUser, orderController.verifyPayment);
router.get("/myorders", isValidUser, orderController.getUserOrders);
router.get("/:id", isValidUser, orderController.getOrderById);

module.exports = router;
