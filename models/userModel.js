// models/userModel.js
const sql = require("mssql");
const dbConfig = require("./db");

const register = async (username, email, password) => {
    try {
        // Connect to database
        let pool = await sql.connect(dbConfig);
        
        // Check if user already exists
        let existingUser = await pool.request()
            .input("email", sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE email = @email");
            
        if (existingUser.recordset.length > 0) {
            throw new Error("Email đã được sử dụng");
        }
        
        // Insert new user
        let result = await pool.request()
            .input("username", sql.NVarChar, username)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, password) // Note: In production, hash this password!
            .query("INSERT INTO Users (username, email, password,role) VALUES (@username, @email, @password,2); SELECT SCOPE_IDENTITY() AS user_id;");
            
        return result.recordset[0].user_id;
    } catch (err) {
        throw new Error("Lỗi khi đăng ký: " + err.message);
    }
};

const authenticate = async (email, password) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, password) // Note: In production, use proper password comparison!
            .query("SELECT * FROM Users WHERE email = @email AND password = @password");
        return result.recordset[0];
    } catch (err) {
        throw new Error("Lỗi khi xác thực: " + err.message);
    }
};

module.exports = { register, authenticate };