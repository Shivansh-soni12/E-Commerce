const express = require("express");
const { getDashboard } = require("../controllers/DashboardController");
const {authMiddleware } = require('../middleware/AuthMiddleware');

const router = express.Router();

router.get("/", authMiddleware, getDashboard);

module.exports = router;
