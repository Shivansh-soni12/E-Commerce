const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    
    enum: ["pending", "shipped", "delivered", "cancelled", "completed", "returned"], 
    default: "pending",
    lowercase: true, 
    trim: true
  },
  totalAmount: { type: Number, required: true },
  items: [orderItemSchema],
  shippingAddress: { type: String },
  cancelReason: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);