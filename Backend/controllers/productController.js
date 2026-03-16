const Product = require("../models/Product");

const addProduct = async (req, res) => {
  try {
    
    const { name, description, price, category, brand } = req.body;

    console.log("Uploaded File:", req.file); 

   
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; 
    }

    const product = new Product({ 
      name, 
      description, 
      price, 
      category, 
      brand, 
      imageUrl  
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductByIdOrName = async (req, res) => {
  try {
    const { prodID_OR_ProdName } = req.params;
    let product;

   
    if (prodID_OR_ProdName.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(prodID_OR_ProdName);
    } else {
      product = await Product.findOne({ name: prodID_OR_ProdName });
    }

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData = { ...req.body }; 

    if (req.file) {
   
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  addProduct, 
  getProducts, 
  getProductByIdOrName, 
  updateProduct, 
  deleteProduct 
};