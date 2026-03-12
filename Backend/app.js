const express = require("express");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const path = require("path");
const app = express();
app.use(cookieParser());
app.use(express.json());

const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(uploadDir));
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,              
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS","PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/auth',userRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
