const movieModel = require("../models/movieModel");
const CommentController = require('./commentController');

const getWatchPage = async (req, res) => {
    try {
        const movieId = req.params.id;
        console.log('Fetching movie with ID:', movieId);
        
        const result = await movieModel.getMovieById(movieId);
        console.log('Query result:', result);

        // Xử lý cả trường hợp result là array hoặc object
        let movie;
        if (Array.isArray(result)) {
            if (result.length === 0) {
                console.log('Movie not found');
                return res.status(404).render('error', {
                    message: 'Không tìm thấy phim'
                });
            }
            movie = result[0];
        } else {
            if (!result) {
                console.log('Movie not found');
                return res.status(404).render('error', {
                    message: 'Không tìm thấy phim'
                });
            }
            movie = result;
        }

        console.log('Found movie:', movie);

        // Lấy danh sách comments
        const comments = await CommentController.getComments(movieId);

        res.render('pages/watch', {
            title: movie.title,
            movie: movie,
            comments: comments || [],
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session ? req.session.user : null,
            messages: req.flash()
        });
    } catch (error) {
        console.error('Error in getWatchPage:', error);
        res.status(500).render('error', {
            message: 'Có lỗi xảy ra khi tải thông tin phim'
        });
    }
};

module.exports = {
    getWatchPage
}; 