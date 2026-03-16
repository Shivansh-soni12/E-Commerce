const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Try to get token from cookies first
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // CRITICAL: Make sure 'id' matches what you put in the payload during login
    req.user = { id: decoded.id }; 
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};


module.exports={authMiddleware};