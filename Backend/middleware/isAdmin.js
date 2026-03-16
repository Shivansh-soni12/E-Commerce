// middleware/isAdmin.js
module.exports = (req, res, next) => {
    // authMiddleware usually puts user data in req.user
    if (req.user && req.user.role === 'admin') {
        next(); // They are admin, let them through!
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};