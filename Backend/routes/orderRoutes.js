const express = require("express");
const {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderByUserAndId,
  updateOrder,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  returnOrder
} = require("../controllers/orderController");
const { authMiddleware } = require('../middleware/AuthMiddleware');
// const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

// 1. Specific Getters (Keep these at the top)
router.get("/stats/:userId", authMiddleware, getOrderStats);
router.get("/detail/:id", authMiddleware, getOrderById);
router.get("/user/:userId", authMiddleware, getOrdersByUser); // This is the standard one for your Angular service

// 2. Main Order Actions
router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getAllOrders);

// 3. Status and General Updates
// Note: Put specific paths like /status BEFORE generic /:id updates
router.patch("/:id/status", authMiddleware, updateOrderStatus);
router.patch("/:id", authMiddleware, updateOrder);

// 4. Nested Lookups (Specific to user + order)
router.get("/:userId/:orderId", authMiddleware, getOrderByUserAndId);

//return
router.patch('/:id/return', authMiddleware, returnOrder);

// REMOVED: router.get("/:userId", ...) 
// We removed this because it conflicts with "/" and "/user/:userId"
// It's better to be explicit with "/user/:userId" to avoid routing bugs.

module.exports = router;