const sql = require("mssql");
const dbConfig = require("../config/db");

// Lấy danh sách phim
const getAllMovies = async () => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM Movies");
    return result.recordset;
};

// Lấy phim theo ID
const getMovieById = async (id) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM Movies WHERE movie_id = @id");
            
        if (result.recordset.length === 0) {
            console.log(`No movie found with ID: ${id}`);
            return null;
        }
        
        return result.recordset[0];
    } catch (error) {
        console.error('Error in getMovieById:', error);
        throw error;
    }
};

// Lấy danh sách thể loại (genre) duy nhất
const getAllGenres = async () => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .query("SELECT DISTINCT genre FROM Movies WHERE genre IS NOT NULL");
    return result.recordset;
};

// Lấy phim theo thể loại
const getMoviesByGenre = async (genre) => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .input("genre", sql.NVarChar, genre)
        .query("SELECT * FROM Movies WHERE genre = @genre");
    return result.recordset;
};

// Lấy phim theo thể loại với giới hạn số lượng
const getMoviesByGenreLimit = async (genre, limit) => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .input("genre", sql.NVarChar, genre)
        .input("limit", sql.Int, limit)
        .query("SELECT TOP (@limit) * FROM Movies WHERE genre = @genre ORDER BY created_at DESC");
    return result.recordset;
};

// Lấy phim mới nhất cho slideshow
const getLatestMovies = async (limit) => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .input("limit", sql.Int, limit)
        .query(`
            SELECT TOP (@limit) * 
            FROM Movies 
            WHERE poster_url IS NOT NULL 
            ORDER BY created_at DESC, views DESC
        `);
    return result.recordset;
};

// Tìm kiếm phim
const searchMovies = async (query) => {
    try {
        console.log('Connecting to database...');
        let pool = await sql.connect(dbConfig);
        console.log('Connected to database');

        console.log('Preparing search query...');
        const request = pool.request();
        request.input('searchQuery', sql.NVarChar, `%${query}%`);
        
        console.log('Executing search query...');
        const result = await request.query(`
            SELECT 
                movie_id, 
                title, 
                description, 
                poster_url, 
                video_url, 
                created_at,
                genre
            FROM Movies
            WHERE 
                title LIKE @searchQuery 
                OR description LIKE @searchQuery
                OR genre LIKE @searchQuery
            ORDER BY 
                CASE 
                    WHEN title LIKE @searchQuery THEN 1
                    WHEN description LIKE @searchQuery THEN 2
                    WHEN genre LIKE @searchQuery THEN 3
                    ELSE 4
                END,
                created_at DESC
        `);
        
        console.log('Search completed. Found records:', result.recordset.length);
        return result.recordset;
    } catch (err) {
        console.error('Error in searchMovies:', err);
        console.error('Error details:', {
            message: err.message,
            code: err.code,
            state: err.state
        });
        throw err;
    }
};

module.exports = { 
    getAllMovies, 
    getMovieById, 
    getAllGenres, 
    getMoviesByGenre,
    getMoviesByGenreLimit,
    getLatestMovies,
    searchMovies
};
