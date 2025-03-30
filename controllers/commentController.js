const Comment = require('../models/comment');

class CommentController {
    static async createComment(req, res) {
        try {
            const { movieId } = req.params;
            const { content, is_anonymous } = req.body;
            
            // Kiểm tra user đã đăng nhập chưa
            if (!req.session || !req.session.user) {
                return res.redirect('/login');
            }

            const userId = req.session.user.id; // Sử dụng id thay vì user_id

            if (!content) {
                req.flash('error', 'Nội dung bình luận không được để trống');
                return res.redirect(`/watch/${movieId}`);
            }

            await Comment.create(movieId, userId, content, is_anonymous === '1');
            req.flash('success', 'Bình luận đã được gửi thành công');
            res.redirect(`/watch/${movieId}`);
        } catch (err) {
            console.error('Error in createComment:', err);
            req.flash('error', 'Có lỗi xảy ra khi gửi bình luận');
            res.redirect(`/watch/${req.params.movieId}`);
        }
    }

    static async getComments(movieId) {
        try {
            return await Comment.getByMovieId(movieId);
        } catch (err) {
            console.error('Error in getComments:', err);
            return [];
        }
    }
}

module.exports = CommentController; 