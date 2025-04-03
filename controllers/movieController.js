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
        // Kiểm tra quyền admin
        if (!req.session.user || req.session.user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền thêm phim. Chỉ admin mới có quyền này.'
            });
        }

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

// Xóa phim
const deleteMovie = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.session.user || req.session.user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xóa phim'
            });
        }

        const movieId = req.params.id;

        // Xóa phim khỏi database
        await db.pool.request()
            .input('movie_id', movieId)
            .query('DELETE FROM Movies WHERE movie_id = @movie_id');

        res.json({
            success: true,
            message: 'Xóa phim thành công'
        });
    } catch (error) {
        console.error('Lỗi xóa phim:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xóa phim',
            error: error.message
        });
    }
};

// Hiển thị form sửa phim
const showEditMovieForm = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.session.user || req.session.user.role_id !== 1) {
            console.log('User not authorized:', req.session.user);
            return res.status(403).render('error', {
                message: 'Bạn không có quyền sửa phim',
                user: req.session.user
            });
        }

        const movieId = req.params.id;
        console.log('Fetching movie with ID:', movieId);
        
        const movie = await movieModel.getMovieById(movieId);
        console.log('Movie data:', JSON.stringify(movie, null, 2));

        if (!movie) {
            console.log('Movie not found');
            return res.status(404).render('error', {
                message: 'Không tìm thấy phim',
                user: req.session.user
            });
        }

        console.log('Rendering edit-movie template with movie:', JSON.stringify(movie, null, 2));
        res.render('pages/edit-movie', {
            movie,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error in showEditMovieForm:', error);
        res.status(500).render('error', {
            message: 'Lỗi server',
            user: req.session.user
        });
    }
};

// Cập nhật phim
const updateMovie = async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (!req.session.user || req.session.user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền sửa phim'
            });
        }

        const movieId = req.params.id;
        const { title, description, genre, poster_url, video_url } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!title || !description || !genre || !poster_url || !video_url) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Cập nhật phim trong database
        await db.pool.request()
            .input('movie_id', movieId)
            .input('title', title)
            .input('description', description)
            .input('genre', genre)
            .input('poster_url', poster_url)
            .input('video_url', video_url)
            .query(`
                UPDATE Movies 
                SET title = @title,
                    description = @description,
                    genre = @genre,
                    poster_url = @poster_url,
                    video_url = @video_url
                WHERE movie_id = @movie_id
            `);

        res.json({
            success: true,
            message: 'Cập nhật phim thành công'
        });
    } catch (error) {
        console.error('Lỗi cập nhật phim:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật phim',
            error: error.message
        });
    }
};

// Hiển thị trang phim mới
const showNewMovies = async (req, res) => {
    try {
        const result = await db.pool.request()
            .query(`
                SELECT TOP 12 * FROM Movies 
                ORDER BY created_at DESC
            `);

        const movies = result.recordset;
        
        res.render('pages/new-movies', {
            title: 'Phim Mới',
            movies: movies,
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phim mới:', error);
        res.status(500).render('pages/error', {
            title: 'Lỗi',
            message: 'Đã xảy ra lỗi khi tải danh sách phim mới'
        });
    }
};

// Tăng lượt xem phim
const incrementViews = async (req, res) => {
    try {
        const movieId = req.params.id;
        
        // Tăng views lên 1
        await db.pool.request()
            .input('movie_id', movieId)
            .query(`
                UPDATE Movies 
                SET views = views + 1 
                WHERE movie_id = @movie_id
            `);

        res.json({
            success: true,
            message: 'Đã tăng lượt xem'
        });
    } catch (error) {
        console.error('Lỗi khi tăng lượt xem:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tăng lượt xem'
        });
    }
};

module.exports = { 
    getAllMovies, 
    getMovieById,
    watchMovie,
    showMovieDetail,
    showAddMovieForm,
    addMovie,
    deleteMovie,
    showEditMovieForm,
    updateMovie,
    showNewMovies,
    incrementViews
};
