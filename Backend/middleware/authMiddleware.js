const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("./tokenBlacklist");
const User = require("../models/User");
 
 
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "No token provided" });
 
  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated. Please login again." });
  }
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
 
    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
 
module.exports = { authMiddleware };
 