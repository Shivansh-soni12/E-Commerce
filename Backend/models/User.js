const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  shippingAddress: { type: String, default: "" },
  paymentDetails: { type: String, default: "" },
  cart: [cartItemSchema],
  wishlist: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
