const sql = require("mssql");
const dbConfig = require("./db");

// Lấy danh sách phim
const getAllMovies = async () => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM Movies");
    return result.recordset;
};

// Lấy phim theo ID
const getMovieById = async (id) => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM Movies WHERE movie_id = @id");
    return result.recordset[0];
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

module.exports = { 
    getAllMovies, 
    getMovieById, 
    getAllGenres, 
    getMoviesByGenre,
    getMoviesByGenreLimit,
    getLatestMovies 
};
