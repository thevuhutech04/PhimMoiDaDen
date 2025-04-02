const movieModel = require("../models/movieModel");
const CommentController = require('./commentController');
const db = require('../config/db');

// Lấy tất cả phim và truyền vào view
const getAllMovies = async (req, res) => {
    try {
        const movies = await movieModel.getAllMovies();
        res.render("index", { 
            movies: movies,
            user: req.session.user
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
        res.render("movieDetail", { 
            movie,
            user: req.session.user
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

// Xử lý hiển thị trang watch
const watchMovie = async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await movieModel.getMovieById(movieId);
        const comments = await CommentController.getComments(movieId);
        
        if (!movie) {
            req.flash('error', 'Không tìm thấy phim');
            return res.redirect('/');
        }

        res.render('pages/watch', {
            movie,
            comments: comments || [],
            user: req.session.user
        });
    } catch (err) {
        console.error('Error in watch page:', err);
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('/');
    }
};

const showMovieDetail = async (req, res) => {
    try {
        const movieId = req.params.id;
        const movie = await movieModel.getMovieById(movieId);
        
        if (!movie) {
            return res.status(404).render("pages/error", { 
                message: "Không tìm thấy phim",
                user: req.session.user
            });
        }

        res.render("pages/movie-detail", { 
            movie,
            user: req.session.user
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).render("pages/error", { 
            message: "Lỗi server",
            user: req.session.user
        });
    }
};

// Hiển thị form thêm phim
const showAddMovieForm = async (req, res) => {
    try {
        res.render('pages/add-movie', {
            user: req.session.user,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

// Xử lý thêm phim mới
const addMovie = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { title, description, genre, poster_url, video_url } = req.body;

        // Log từng trường để kiểm tra
        console.log('Title:', title);
        console.log('Description:', description);
        console.log('Genre:', genre);
        console.log('Poster URL:', poster_url);
        console.log('Video URL:', video_url);

        // Kiểm tra dữ liệu đầu vào
        if (!title || !description || !genre || !poster_url || !video_url) {
            const missingFields = [];
            if (!title) missingFields.push('tiêu đề');
            if (!description) missingFields.push('mô tả');
            if (!genre) missingFields.push('thể loại');
            if (!poster_url) missingFields.push('URL poster');
            if (!video_url) missingFields.push('URL video');
            
            return res.status(400).json({
                success: false,
                message: `Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`
            });
        }

        // Kiểm tra URL hợp lệ
        try {
            new URL(poster_url);
            new URL(video_url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'URL poster hoặc URL video không hợp lệ'
            });
        }

        // Kiểm tra URL poster có phải là URL ảnh trực tiếp
        if (poster_url.includes('google.com/url')) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng sử dụng URL trực tiếp của ảnh poster, không sử dụng URL từ Google Search'
            });
        }

        // Kiểm tra URL video có phải là URL embed hợp lệ
        const validVideoPatterns = [
            'dailymotion.com/player',
            'dailymotion.com/embed',
            'youtube.com/embed',
            'player.vimeo.com'
        ];

        const isValidVideoUrl = validVideoPatterns.some(pattern => video_url.includes(pattern));
        if (!isValidVideoUrl) {
            return res.status(400).json({
                success: false,
                message: 'URL video phải là mã nhúng (embed) từ Dailymotion, YouTube hoặc Vimeo'
            });
        }

        // Thêm phim mới vào database
        const result = await db.pool.request()
            .input('title', title)
            .input('description', description)
            .input('genre', genre)
            .input('poster_url', poster_url)
            .input('video_url', video_url)
            .input('views', 0)
            .input('created_at', new Date())
            .query(`
                INSERT INTO Movies (title, description, genre, poster_url, video_url, views, created_at)
                OUTPUT INSERTED.movie_id
                VALUES (@title, @description, @genre, @poster_url, @video_url, @views, @created_at)
            `);

        const movieId = result.recordset[0].movie_id;

        res.json({
            success: true,
            message: 'Thêm phim thành công',
            movieId: movieId
        });
    } catch (error) {
        console.error('Lỗi:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm phim: ' + error.message
        });
    }
};

module.exports = { 
    getAllMovies, 
    getMovieById,
    watchMovie,
    showMovieDetail,
    showAddMovieForm,
    addMovie
};
