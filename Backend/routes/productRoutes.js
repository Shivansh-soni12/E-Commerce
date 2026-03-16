const express = require("express");
const router = express.Router();
const { 
  addProduct, 
  getProducts, 
  getProductByIdOrName, 
  updateProduct, 
  deleteProduct 
} = require("../controllers/productController");

const upload = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/AuthMiddleware");
const isAdmin = require("../middleware/isAdmin");

router.post("/", authMiddleware, isAdmin, upload.single("image"), addProduct);
router.get("/", getProducts);
router.get("/:prodID_OR_ProdName", getProductByIdOrName);
router.patch("/:id", authMiddleware, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);


router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
  
    const regex = new RegExp(searchTerm, 'i');

    const results = await Product.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex }
      ]
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
});
module.exports = router;