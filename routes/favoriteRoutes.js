const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.get("/favorites/:userId", favoriteController.getFavoritesByUserId);
router.post("/favorites", favoriteController.addFavorite);

module.exports = router;
