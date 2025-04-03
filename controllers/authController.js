const db = require('../config/db');
const bcrypt = require('bcrypt');

// Xử lý đăng ký
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm người dùng mới vào database
        const result = await db.pool.request()
            .input('username', username)
            .input('email', email)
            .input('password', hashedPassword)
            .input('role_id', 2) // Mặc định là user (role_id = 2)
            .input('created_at', new Date())
            .query(`
                INSERT INTO users (username, email, password, role_id, created_at)
                VALUES (@username, @email, @password, @role_id, @created_at)
            `);

        res.json({
            success: true,
            message: 'Đăng ký thành công'
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng ký',
            error: error.message
        });
    }
};

// Xử lý đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Tìm người dùng theo email
        const result = await db.pool.request()
            .input('email', email)
            .query(`
                SELECT user_id, username, email, password, role_id
                FROM users
                WHERE email = @email
            `);

        const user = result.recordset[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Lưu thông tin người dùng vào session
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
        };

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role_id: user.role_id
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng nhập',
            error: error.message
        });
    }
};

// Xử lý đăng xuất
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi đăng xuất'
            });
        }
        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    });
};

module.exports = {
    register,
    login,
    logout
}; 