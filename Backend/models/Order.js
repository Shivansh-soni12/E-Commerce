// const mongoose = require("mongoose");

// const orderItemSchema = new mongoose.Schema({
//   productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//   quantity: { type: Number, required: true },
//   priceAtPurchase: { type: Number, required: true }
// });

// const orderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
//   totalAmount: { type: Number, required: true },
//   items: [orderItemSchema],
//   createdAt: { type: Date, default: Date.now }
// }, { timestamps: true });

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose"); // <--- ADD THIS LINE AT THE TOP

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { 
    type: String, 
    enum: ["pending", "shipped", "delivered", "cancelled", "completed","returned"], 
    default: "pending",
    lowercase: true, // Forces "Delivered" -> "delivered"
    trim: true       // Removes accidental spaces
  },
  totalAmount: { type: Number, required: true },
  items: [orderItemSchema],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);