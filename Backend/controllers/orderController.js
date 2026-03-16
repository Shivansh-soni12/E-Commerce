const Order = require("../models/Order");

// 1. Get Stats for User Dashboard
const getOrderStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Count all orders for this user
    const totalOrders = await Order.countDocuments({ userId });

   
    const pendingCount = await Order.countDocuments({ 
      userId, 
      status: { $in: ["pending", "shipped"] } 
    });

    res.json({ totalOrders, pendingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create New Order
const createOrder = async (req, res) => {
  try {
    const orderData = {
      userId: req.body.userId,
      items: req.body.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price 
      })),
      totalAmount: req.body.totalAmount,
      shippingAddress: req.body.shippingAddress,
      status: "pending" // Default status
    };

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Update Order Status (Admin or User cancel)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
   
    const status = req.body.status?.toLowerCase().trim();
    const { reason } = req.body;

    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization check
const isOwner = order.userId?.toString() === req.user.id?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "No permission to update this order" });
    }

    order.status = status;
    if (reason) {
      order.cancelReason = reason; 
    }
    
    await order.save();
    console.log(`Order ${id} successfully updated to ${status}`);
    res.status(200).json(order);

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check if user is attached (from authMiddleware)
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.userId?.toString() === req.user.id?.toString();

    if (!isOwner) {
      return res.status(403).json({ message: "Only the owner can return this order" });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    order.status = 'returned';
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error("RETURN ERROR:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 }); // Newest first
    res.json(orders);
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

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted" });
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
  returnOrder,
  deleteOrder
};