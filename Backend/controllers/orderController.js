const Order = require("../models/Order");

const getOrderStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const totalOrders = await Order.countDocuments({ userId });
    const pendingCount = await Order.countDocuments({ userId, status: "pending" });
    res.json({ totalOrders, pendingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("items.productId", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// controllers/orderController.js
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
const status = req.body.status?.toLowerCase();
    const { reason } = req.body;
     

    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // FIXED ID COMPARISON:
    // 1. Changed req.user._id to req.user.id (to match your middleware)
    // 2. Added optional chaining (?.) to prevent crashes if something is missing
    const isOwner = order.userId?.toString() === req.user.id?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No permission to update this order" });
    }

    // Update fields
    order.status = status;
    if (reason) {
      order.cancelReason = reason; 
    }
    
    await order.save();
    console.log(`Order ${id} successfully updated to ${status}`);
    res.status(200).json(order);

  } catch (error) {
    console.error("CANNOT UPDATE ORDER:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check if user is the owner
    const isOwner = order.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: "You can only return your own orders" });
    }

    // Only allow return if it was actually delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    order.status = 'returned'; // Make sure 'returned' is in your Schema Enum!
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("Return Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const createOrder = async (req, res) => {
  try {
    const orderData = {
      userId: req.body.userId,
      items: req.body.items.map(item => ({
        productId: item.productId,
        name: item.name,      
        price: item.price,    
        image: item.image,   
        quantity: item.quantity
      })),
      totalAmount: req.body.totalAmount,
      shippingAddress: req.body.shippingAddress,
      status: "pending"
    };

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("items.productId", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderByUserAndId = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const order = await Order.findOne({ _id: orderId, userId })
      .populate("items.productId", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderByUserAndId,
  updateOrder,
  getOrderStats,
  getOrderById,
  updateOrderStatus,
  returnOrder
};
