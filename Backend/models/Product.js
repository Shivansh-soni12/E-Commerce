const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: { type: String, default: "assets/image.png" },
  category: String
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
