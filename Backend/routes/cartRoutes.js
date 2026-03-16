const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  moveCartToWishlist,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart,
  placeOrder,
  getOrders
} = require("../controllers/cartController");

router.get("/:userId", getCart);
router.post("/:userId", addToCart);
router.delete("/:userId/:itemId", removeFromCart);
router.post("/:userId/:itemId/move-to-wishlist", moveCartToWishlist);
router.get("/:userId/wishlist", getWishlist);
router.post("/:userId/wishlist", addToWishlist);
router.delete("/:userId/wishlist/:itemId", removeFromWishlist);
router.post("/:userId/wishlist/:itemId/move-to-cart", moveWishlistToCart);
router.post("/:userId/place-order", placeOrder);
router.get("/orders/:userId", getOrders);
module.exports = router;
