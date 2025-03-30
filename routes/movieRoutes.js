const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const db = require("../config/db");
const { isAuthenticated } = require("../middlewares/authMiddleware");

// Route lấy tất cả phim và hiển thị trên trang chủ
router.get("/", movieController.getAllMovies);

// Route lấy phim theo ID
router.get("/movies/:id", movieController.getMovieById);

// Route cho trang chi tiết phim
router.get('/movie/:id', async (req, res) => {
    try {
        console.log('Fetching movie with ID:', req.params.id);
        
        const result = await db.request()
            .input('movieId', db.sql.Int, req.params.id)
            .query('SELECT * FROM movies WHERE movie_id = @movieId');

        console.log('Query result:', result.recordset);

        if (result.recordset.length === 0) {
            console.log('Movie not found');
            return res.status(404).render('error', {
                message: 'Không tìm thấy phim'
            });
        }

        const movie = result.recordset[0];
        console.log('Found movie:', movie);

        // Kiểm tra xem phim có trong danh sách yêu thích không
        let isFavorite = false;
        if (req.session && req.session.user) {
            console.log('Checking favorites for user:', req.session.user.id);
            const favoriteResult = await db.request()
                .input('userId', db.sql.Int, req.session.user.id)
                .input('movieId', db.sql.Int, req.params.id)
                .query('SELECT * FROM favorites WHERE user_id = @userId AND movie_id = @movieId');
            
            isFavorite = favoriteResult.recordset.length > 0;
            console.log('Is favorite:', isFavorite);
        }

        res.render('pages/movie-detail', {
            title: movie.title,
            movie: movie,
            isFavorite: isFavorite,
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).render('error', {
            message: 'Có lỗi xảy ra khi tải thông tin phim'
        });
    }
});

// Route cho trang favorites
router.get('/favorites', isAuthenticated, async (req, res) => {
    try {
        // Lấy danh sách phim yêu thích của user từ database
        const result = await db.request()
            .input('userId', db.sql.Int, req.user.id)
            .query(`
                SELECT m.* 
                FROM movies m 
                INNER JOIN favorites f ON m.movie_id = f.movie_id 
                WHERE f.user_id = @userId
            `);

        res.render('pages/favorites', {
            title: 'Phim Yêu Thích',
            favoriteMovies: result.recordset,
            isAuthenticated: req.isAuthenticated,
            user: req.user
        });
    } catch (error) {
        console.error('Error fetching favorite movies:', error);
        res.status(500).render('error', {
            message: 'Có lỗi xảy ra khi tải danh sách phim yêu thích'
        });
    }
});

module.exports = router;