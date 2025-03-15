const movieModel = require("../models/movieModel");

// Lấy danh sách phim mới và render vào trang home
const getHomePage = async (req, res) => {
    try {
        const movies = await movieModel.getAllMovies();  // Lấy danh sách phim
        
        // Truyền cả biến isAuthenticated và user vào template
        res.render("pages/home", { 
            title: "PhimMoiDaDen|PhimMoiChill|Xem Phim Chill", 
            movies: movies,
            isAuthenticated: req.session.isAuthenticated || false,
            user: req.session.user || null
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getHomePage };