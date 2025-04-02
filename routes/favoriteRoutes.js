const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// Route hiển thị trang yêu thích
router.get("/favorites", favoriteController.showFavoritesPage);

// API routes
router.post("/api/favorites/toggle", favoriteController.toggleFavorite);
router.get("/api/favorites/check/:movieId", favoriteController.checkFavoriteStatus);

module.exports = router;
