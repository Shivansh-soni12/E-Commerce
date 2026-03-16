const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { addToBlacklist } = require("../middleware/tokenBlacklist");
const jwt = require("jsonwebtoken");
const { get } = require("mongoose");

const registerUser = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,   
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 
    });

    res.json({ 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart: user.cart,
        wishlist: user.wishlist,
        shippingAddress: user.shippingAddress, 
      paymentDetails: user.paymentDetails,   
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(400).json({ message: "No token found in cookies" });

    addToBlacklist(token);

    res.clearCookie("token", { httpOnly: true, secure: true });
    res.json({ message: "Logout successful. Token invalidated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.shippingAddress !== undefined) user.shippingAddress = req.body.shippingAddress;
    if (req.body.paymentDetails !== undefined) user.paymentDetails = req.body.paymentDetails;

    if (req.body.cart) {
      user.cart = req.body.cart.map(item => ({
        productId: item.productId || item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image || ""
      }));
    }

    if (req.body.wishlist) {
      user.wishlist = req.body.wishlist.map(item => ({
        productId: item.productId || item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image || ""
      }));
    }

    const updatedUser = await user.save();

    res.json({ 
      message: "Profile updated successfully", 
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        shippingAddress: updatedUser.shippingAddress,
        paymentDetails: updatedUser.paymentDetails,
        cart: updatedUser.cart,
        wishlist: updatedUser.wishlist
      } 
    });
  } catch (error) {
    console.error("Backend Update Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const checkMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid session" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, updateProfile, getUserById,checkMe };
