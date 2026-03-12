

const getDashboard = async (req, res) => {
  try {
    
    const { role } = req.user;

    if (role === "admin") {
      return res.json({
        role: "admin",
        redirectTo: "/admin/dashboard",
        message: "Welcome to the Admin Dashboard"
      });
    } else if (role === "user") {
      return res.json({
        role: "user",
        redirectTo: "/user/dashboard",
        message: "Welcome to the User Dashboard"
      });
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };