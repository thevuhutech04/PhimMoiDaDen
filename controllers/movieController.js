const movieModel = require("../models/movieModel");
const CommentController = require('./commentController');

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

module.exports = { 
    getAllMovies, 
    getMovieById,
    watchMovie,
    showMovieDetail
};
