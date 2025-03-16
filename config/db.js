const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'movie_db',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', err => {
    console.error('Database connection error:', err);
});

module.exports = {
    request: () => pool.request(),
    pool: pool,
    sql: sql
}; 