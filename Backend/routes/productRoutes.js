const express = require("express");
const router = express.Router();
const { 
  addProduct, 
  getProducts, 
  getProductByIdOrName, 
  updateProduct, 
  deleteProduct 
} = require("../controllers/productController");

// Use your existing middleware file for consistency
const upload = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/AuthMiddleware");
const isAdmin = require("../middleware/isAdmin");

// --- ROUTES ---

// POST: Add Product (Admin Only)
// Use upload.single("image") to match your middleware setup
router.post("/", authMiddleware, isAdmin, upload.single("image"), addProduct);

// GET: All Products (Public)
router.get("/", getProducts);

// GET: Single Product (Public)
router.get("/:prodID_OR_ProdName", getProductByIdOrName);

// PATCH: Update Product (Admin Only)
router.patch("/:id", authMiddleware, isAdmin, upload.single("image"), updateProduct);

// DELETE: Delete Product (Admin Only)
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;