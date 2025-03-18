const db = require('../config/db');

const getWatchPage = async (req, res) => {
    try {
        const movieId = req.params.id;
        console.log('Fetching movie with ID:', movieId); // Debug log

        // Đợi kết nối database
        await db.pool.connect();
        
        // Lấy thông tin phim từ database
        const query = `
            SELECT movie_id, title, description, video_url, poster_url, created_at
            FROM Movies
            WHERE movie_id = @movieId
        `;
        
        const request = db.pool.request();
        request.input('movieId', db.sql.Int, parseInt(movieId));
        
        console.log('Executing query:', query); // Debug log
        const result = await request.query(query);
        console.log('Query result:', result); // Debug log
        
        if (!result.recordset || result.recordset.length === 0) {
            console.log('No movie found with ID:', movieId); // Debug log
            return res.status(404).render('pages/error', {
                message: 'Không tìm thấy phim',
                error: { status: 404 },
                isAuthenticated: req.session.isAuthenticated,
                user: req.session.user
            });
        }

        const movie = result.recordset[0];
        console.log('Found movie:', movie); // Debug log
        
        // Render trang xem phim
        res.render('pages/watch', { 
            movie,
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin phim:', error);
        res.status(500).render('pages/error', {
            message: 'Đã xảy ra lỗi khi tải phim',
            error: { status: 500 },
            isAuthenticated: req.session.isAuthenticated,
            user: req.session.user
        });
    }
};

module.exports = {
    getWatchPage
}; 