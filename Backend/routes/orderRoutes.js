const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderByUserAndId,
  updateOrder,
  
  getOrderStats,
  getOrderById,
  updateOrderStatus
} = require("../controllers/orderController");
const {authMiddleware} = require('../middleware/AuthMiddleware');

const router = express.Router();

router.get("/stats/:userId", authMiddleware, getOrderStats);
router.get("/detail/:id", authMiddleware, getOrderById);
router.get("/user/:userId", authMiddleware, getOrdersByUser); 
router.get("/:userId", authMiddleware, getOrdersByUser); 
router.get("/:userId/:orderId", authMiddleware, getOrderByUserAndId);
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getAllOrders);
router.patch("/:id", authMiddleware, updateOrder);
router.patch("/:id/status", authMiddleware, updateOrderStatus);
module.exports = router;