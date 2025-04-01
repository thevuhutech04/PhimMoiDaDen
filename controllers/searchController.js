const MovieModel = require('../models/movieModel');

const searchMovies = async (req, res) => {
    try {
        const query = req.query.q || '';
        console.log('Search query:', query);
        
        if (!query.trim()) {
            console.log('Empty search query, redirecting to home');
            return res.redirect('/');
        }

        console.log('Searching movies...');
        const movies = await MovieModel.searchMovies(query);
        console.log('Search results:', movies);

        if (!movies || movies.length === 0) {
            console.log('No movies found');
            return res.render('pages/no-results', {
                title: 'Không tìm thấy phim',
                query: query,
                isAuthenticated: req.session && req.session.user ? true : false,
                user: req.session ? req.session.user : null
            });
        }

        res.render('pages/search', {
            title: `Kết quả tìm kiếm: ${query}`,
            movies: movies,
            query: query,
            isAuthenticated: req.session && req.session.user ? true : false,
            user: req.session ? req.session.user : null
        });
    } catch (err) {
        console.error('Error in searchMovies:', err);
        res.status(500).render('error', {
            message: 'Có lỗi xảy ra khi tìm kiếm phim',
            error: err.message
        });
    }
};

module.exports = {
    searchMovies
}; 