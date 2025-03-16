const express = require('express');
const router = express.Router();
const { getHomePage } = require('../controllers/homeController');
const { getWatchPage } = require('../controllers/watchController');
const userRoutes = require('./userRoutes');

// Route trang chủ
router.get('/', getHomePage);

// Route xem phim
router.get('/watch/:id', getWatchPage);

// Sử dụng userRoutes cho các route liên quan đến user
router.use('/', userRoutes);

module.exports = router; 