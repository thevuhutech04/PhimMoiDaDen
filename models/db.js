const sql = require("mssql");

const config = {
  server: "localhost",
  port: 1433,
  database: "movie_db", // Tên database của bạn
  user: "cuong142", // Thay bằng tài khoản SQL của bạn
  password: "cuong142.", // Thay bằng mật khẩu
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

sql.connect(config)
  .then(() => console.log("✅ Kết nối SQL Server thành công!"))
  .catch((err) => console.error("❌ Lỗi kết nối SQL Server:", err));

const connectDB = async () => {
    try {
      const pool = await sql.connect(config);
      console.log('Connected to SQL Server');
      return pool;
    } catch (err) {
      console.error('Error connecting to SQL Server or creating table:', err);
      throw err;
    }
  };
  
  module.exports = connectDB();