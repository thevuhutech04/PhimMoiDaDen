const express = require('express');
const router = express.Router();
const { getHomePage } = require('../controllers/homeController');
const { getWatchPage } = require('../controllers/watchController');

// Route trang chủ
router.get('/', getHomePage);

// Route xem phim
router.get('/watch/:id', getWatchPage);

module.exports = router; 