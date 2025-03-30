const sql = require('mssql');
const db = require('../config/db');

class Comment {
    static async create(movieId, userId, content, isAnonymous) {
        try {
            const pool = await sql.connect(db);
            const result = await pool.request()
                .input('movie_id', sql.Int, movieId)
                .input('user_id', sql.Int, userId)
                .input('content', sql.NVarChar, content)
                .input('is_anonymous', sql.Bit, isAnonymous)
                .query(`
                    INSERT INTO comments (movie_id, user_id, content, is_anonymous)
                    VALUES (@movie_id, @user_id, @content, @is_anonymous);
                    SELECT SCOPE_IDENTITY() AS comment_id;
                `);
            return result.recordset[0].comment_id;
        } catch (err) {
            console.error('Error creating comment:', err);
            throw err;
        }
    }

    static async getByMovieId(movieId) {
        try {
            const pool = await sql.connect(db);
            const result = await pool.request()
                .input('movie_id', sql.Int, movieId)
                .query(`
                    SELECT c.*, u.username
                    FROM comments c
                    JOIN users u ON c.user_id = u.user_id
                    WHERE c.movie_id = @movie_id
                    ORDER BY c.created_at DESC
                `);
            return result.recordset;
        } catch (err) {
            console.error('Error getting comments:', err);
            throw err;
        }
    }
}

module.exports = Comment; 