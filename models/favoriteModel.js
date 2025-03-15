const sql = require("mssql");
const dbConfig = require("./db");

const getFavoritesByUserId = async (userId) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input("userId", sql.Int, userId)
            .query(`
                SELECT m.title, m.year, m.poster_url
                FROM Favorites f
                JOIN Movies m ON f.movieId = m.id
                WHERE f.user_id = @userId
            `); // Sửa từ f.userId thành f.user_id nếu bảng Favorites dùng user_id
        return result.recordset.map(favorite => ({
            movie: {
                title: favorite.title,
                year: favorite.year,
                poster_url: favorite.poster_url
            }
        }));
    } catch (err) {
        throw new Error("Lỗi khi lấy danh sách yêu thích: " + err.message);
    }
};

module.exports = { getFavoritesByUserId };