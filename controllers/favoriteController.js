const favoriteModel = require("../models/favoriteModel");

const getFavoritesByUserId = async (req, res) => {
    try {
        const favorites = await favoriteModel.getFavoritesByUserId(req.params.userId);
        res.json(favorites); // API trả về JSON
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

const addFavorite = async (req, res) => {
    try {
        const { userId, movieId } = req.body;
        await favoriteModel.addFavorite(userId, movieId);
        res.status(201).send("Đã thêm vào danh sách yêu thích");
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

// Hiển thị trang danh sách yêu thích
const showFavoritesPage = async (req, res) => {
    try {
        if (!req.session.user) {
            req.session.redirectUrl = '/favorites';
            return res.redirect("/login");
        }
        const favorites = await favoriteModel.getFavoritesByUserId(req.session.user.id);
        res.render("pages/favorites", { 
            favorites,
            isAuthenticated: true,
            user: req.session.user
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

// API thêm/xóa yêu thích
const toggleFavorite = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Vui lòng đăng nhập để thực hiện chức năng này",
                redirect: "/login"
            });
        }

        const { movieId } = req.body;
        const isFavorite = await favoriteModel.isFavorite(req.session.user.id, movieId);

        if (isFavorite) {
            await favoriteModel.removeFavorite(req.session.user.id, movieId);
            return res.json({ 
                success: true, 
                isFavorite: false,
                message: "Đã xóa khỏi danh sách yêu thích" 
            });
        } else {
            await favoriteModel.addFavorite(req.session.user.id, movieId);
            return res.json({ 
                success: true, 
                isFavorite: true,
                message: "Đã thêm vào danh sách yêu thích" 
            });
        }
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server" 
        });
    }
};

// API kiểm tra trạng thái yêu thích
const checkFavoriteStatus = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({ 
                isFavorite: false,
                isAuthenticated: false
            });
        }

        const { movieId } = req.params;
        const isFavorite = await favoriteModel.isFavorite(req.session.user.id, movieId);
        res.json({ 
            isFavorite,
            isAuthenticated: true
        });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server" 
        });
    }
};

module.exports = { 
    getFavoritesByUserId, 
    addFavorite, 
    showFavoritesPage, 
    toggleFavorite,
    checkFavoriteStatus 
};