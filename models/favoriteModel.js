const sql = require("mssql");
const dbConfig = require("./db");

const getFavoritesByUserId = async (userId) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT m.movie_id, m.title, m.description, m.poster_url, m.genre, m.created_at
                FROM Favorites f
                JOIN Movies m ON f.movie_id = m.movie_id
                WHERE f.user_id = @userId
                ORDER BY f.added_at DESC
            `);
        return result.recordset;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách yêu thích:", err);
        throw new Error("Lỗi khi lấy danh sách yêu thích: " + err.message);
    }
};

const addFavorite = async (userId, movieId) => {
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input("userId", sql.Int, userId)
            .input("movieId", sql.Int, movieId)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM Favorites WHERE user_id = @userId AND movie_id = @movieId)
                BEGIN
                    INSERT INTO Favorites (user_id, movie_id, added_at)
                    VALUES (@userId, @movieId, GETDATE())
                END
            `);
        return true;
    } catch (err) {
        console.error("Lỗi khi thêm yêu thích:", err);
        throw new Error("Lỗi khi thêm yêu thích: " + err.message);
    }
};

const removeFavorite = async (userId, movieId) => {
    try {
        let pool = await sql.connect(dbConfig);
        await pool.request()
            .input("userId", sql.Int, userId)
            .input("movieId", sql.Int, movieId)
            .query(`
                DELETE FROM Favorites 
                WHERE user_id = @userId AND movie_id = @movieId
            `);
        return true;
    } catch (err) {
        console.error("Lỗi khi xóa yêu thích:", err);
        throw new Error("Lỗi khi xóa yêu thích: " + err.message);
    }
};

const isFavorite = async (userId, movieId) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input("userId", sql.Int, userId)
            .input("movieId", sql.Int, movieId)
            .query(`
                SELECT COUNT(*) as count
                FROM Favorites
                WHERE user_id = @userId AND movie_id = @movieId
            `);
        return result.recordset[0].count > 0;
    } catch (err) {
        console.error("Lỗi khi kiểm tra yêu thích:", err);
        throw new Error("Lỗi khi kiểm tra yêu thích: " + err.message);
    }
};

module.exports = { 
    getFavoritesByUserId, 
    addFavorite, 
    removeFavorite,
    isFavorite 
};