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
        .query("SELECT * FROM Movies WHERE id = @id");
    return result.recordset[0];
};

module.exports = { getAllMovies, getMovieById };
