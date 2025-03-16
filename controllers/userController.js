// controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation đầu vào
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ username, email và password' });
        }

        // Kiểm tra username đã tồn tại
        const checkUsername = await db.pool.request()
            .input('username', username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (checkUsername.recordset.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // Kiểm tra email đã tồn tại
        const checkEmail = await db.pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm user mới vào database, dùng giá trị số cho role (1 = user)
        const result = await db.pool.request()
            .input('username', username)
            .input('email', email)
            .input('password', hashedPassword)
            .input('role', 1) // Sửa thành giá trị số thay vì chuỗi 'user'
            .query(`
                INSERT INTO Users (username, email, password, role)
                VALUES (@username, @email, @password, @role);
                SELECT SCOPE_IDENTITY() AS user_id;
            `);

        const userId = result.recordset[0].user_id;

        // Tạo session
        req.session.isAuthenticated = true;
        req.session.user = {
            id: userId,
            username: username,
            email: email
        };

        res.json({ 
            success: true, 
            message: 'Đăng ký thành công',
            user: {
                username: username,
                email: email
            }
        });
    } catch (error) {
        console.error('Lỗi đăng ký:', error.message, error.stack);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const result = await db.pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const user = result.recordset[0];

        // Kiểm tra mật khẩu
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        // Tạo session cho user
        req.session.isAuthenticated = true;
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email
        };

        res.json({ 
            success: true, 
            message: 'Đăng nhập thành công',
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập' });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

module.exports = {
    register,
    login,
    logout
};