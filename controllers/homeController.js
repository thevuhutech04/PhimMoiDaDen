const movieModel = require("../models/movieModel");

// Lấy danh sách phim mới và render vào trang home
const getHomePage = async (req, res) => {
    try {
        // Lấy danh sách thể loại
        const genres = await movieModel.getAllGenres();
        
        // Lấy 4 phim mới nhất cho slideshow
        const slideshowMovies = await movieModel.getLatestMovies(4);
        
        // Tạo object để lưu phim theo thể loại
        const moviesByGenre = {};
        
        // Lấy 8 phim mới nhất cho mỗi thể loại
        for (const genreObj of genres) {
            const genre = genreObj.genre;
            const movies = await movieModel.getMoviesByGenreLimit(genre, 8);
            if (movies.length > 0) {
                moviesByGenre[genre] = movies;
            }
        }
        
        // Truyền cả biến isAuthenticated và user vào template
        res.render("pages/home", { 
            title: "PhimMoiDaDen|PhimMoiChill|Xem Phim Chill", 
            moviesByGenre: moviesByGenre,
            slideshowMovies: slideshowMovies,
            genres: genres.map(g => g.genre),
            isAuthenticated: req.session.isAuthenticated || false,
            user: req.session.user || null
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getHomePage };