// controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const emailCheck = await db.pool.request()
            .input('email', email)
            .query('SELECT * FROM Users WHERE email = @email');

        if (emailCheck.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email đã được sử dụng. Vui lòng sử dụng email khác."
            });
        }

        // Kiểm tra username đã tồn tại chưa
        const usernameCheck = await db.pool.request()
            .input('username', username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (usernameCheck.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác."
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Thêm người dùng mới vào database
        const result = await db.pool.request()
            .input('username', username)
            .input('email', email)
            .input('password', hashedPassword)
            .input('role_id', 2)
            .query(`
                INSERT INTO Users (username, email, password, role_id)
                VALUES (@username, @email, @password, @role_id)
            `);

        // Tạo session cho user mới
        req.session.isAuthenticated = true;
        req.session.user = {
            username: username,
            email: email,
            role_id: 2
        };

        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: {
                username,
                email
            }
        });
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau."
        });
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
            email: user.email,
            role_id: user.role_id
        };

        res.json({ 
            success: true, 
            message: 'Đăng nhập thành công',
            user: {
                username: user.username,
                email: user.email,
                role_id: user.role_id
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