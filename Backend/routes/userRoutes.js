const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  logoutUser, 
  updateProfile,
  getUserById,
  checkMe
} = require("../controllers/userController");
const { authMiddleware } = require('../middleware/authMiddleware');

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, checkMe);

router.put('/profile/:id', authMiddleware, updateProfile);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;