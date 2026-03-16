const User = require("../models/User");
const Order = require("../models/Order");


const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, name, price, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingItem = user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, name, price, quantity });
    }

    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.id(itemId);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    cartItem.remove();
    await user.save();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moveCartToWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.id(itemId);
    if (!cartItem) return res.status(404).json({ message: "Cart item not found" });

    user.wishlist.push({
      productId: cartItem.productId,
      name: cartItem.name,
      price: cartItem.price,
      quantity: cartItem.quantity
    });

    cartItem.remove();
    await user.save();

    res.json({ message: "Item moved to wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("wishlist.productId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, name, price, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingItem = user.wishlist.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.wishlist.push({ productId, name, price, quantity });
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const wishlistItem = user.wishlist.id(itemId);
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });

    wishlistItem.remove();
    await user.save();
    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moveWishlistToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const wishlistItem = user.wishlist.id(itemId);
    if (!wishlistItem) return res.status(404).json({ message: "Wishlist item not found" });

    user.cart.push({
      productId: wishlistItem.productId,
      name: wishlistItem.name,
      price: wishlistItem.price,
      quantity: wishlistItem.quantity
    });

    wishlistItem.remove();
    await user.save();

    res.json({ message: "Item moved to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const placeOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = user.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      userId,
      items: user.cart.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.price
      })),
      totalAmount
    });

    await order.save();

    user.cart = [];
    await user.save();

    res.json({
      message: "Order placed successfully",
      orderId: order._id,
      createdAt: order.createdAt,
      items: order.items,
      totalAmount: order.totalAmount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "undefined") {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Database Error:", error.message);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

module.exports = {
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
};
