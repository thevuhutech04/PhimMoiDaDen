const sql = require("mssql");
const dbConfig = require("./db");

// Lấy danh sách thể loại
const getAllCategories = async () => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query("SELECT * FROM Categories");
    return result.recordset;
};

// Lấy phim theo thể loại
const getMoviesByCategory = async (categoryId) => {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .input("categoryId", sql.Int, categoryId)
        .query("SELECT * FROM Movies WHERE category_id = @categoryId");
    return result.recordset;
};

module.exports = { getAllCategories, getMoviesByCategory };
