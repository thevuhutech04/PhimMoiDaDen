const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");

// Route lấy tất cả phim và hiển thị trên trang chủ
router.get("/", movieController.getAllMovies);

// Route lấy phim theo ID
router.get("/movies/:id", movieController.getMovieById);

module.exports = router;