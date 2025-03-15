const movieModel = require("../models/movieModel");

// Lấy tất cả phim và truyền vào view
const getAllMovies = async (req, res) => {
    try {
        const movies = await movieModel.getAllMovies();
        res.render("index", { 
            movies: movies // Truyền danh sách phim vào view "index"
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

// Lấy phim theo ID và truyền vào view
const getMovieById = async (req, res) => {
    try {
        const movie = await movieModel.getMovieById(req.params.id);
        if (!movie) return res.status(404).send("Không tìm thấy phim");
        res.render("movieDetail", { movie });  // Giả sử bạn có một view tên là "movieDetail"
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getAllMovies, getMovieById };
