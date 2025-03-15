// controllers/userController.js
const userModel = require("../models/userModel");

const register = async (req, res) => {
    try {
        console.log("Dữ liệu từ req.body:", req.body); // Log data received

        // Extract form data
        const { username, email, password } = req.body;

        // Validate form data
        if (!username || !email || !password) {
            return res.status(400).send("Vui lòng điền đầy đủ thông tin");
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send("Email không hợp lệ");
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).send("Mật khẩu phải có ít nhất 6 ký tự");
        }

        // Register user (model handles the database operations)
        await userModel.register(username, email, password);
        res.status(201).send("Đăng ký thành công");
    } catch (err) {
        console.error("Lỗi trong register:", err);
        res.status(500).send(err.message);
    }
};

const login = async (req, res) => {
    try {
        // Extract login data
        const { email, password } = req.body;
        
        // Validate login data
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng điền email và mật khẩu" });
        }
        
        // Authenticate user
        const user = await userModel.authenticate(email, password);
        if (!user) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        
        // Set session
        req.session.isAuthenticated = true;
        req.session.user = {
            id: user.user_id,
            username: user.username,
            email: user.email
        };
        
        // Trả về success và thông tin người dùng
        res.status(200).json({ 
            success: true,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Lỗi trong login:", err);
        res.status(500).json({ message: err.message });
    }
};
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Lỗi khi đăng xuất:", err);
            return res.status(500).json({ message: "Lỗi khi đăng xuất" });
        }
        res.redirect('/');
    });
};

module.exports = {
    register,
    login,
    logout
};