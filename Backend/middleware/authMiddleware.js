const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Not authorized, no token found in header" });
  }

  const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Token expired or invalid" });
  }
};

module.exports = { authMiddleware };