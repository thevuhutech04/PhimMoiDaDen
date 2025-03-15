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
        const userId = req.session.userId; // Đúng với key đã lưu trong login
        if (!userId) {
            return res.redirect("/login");
        }
        const favorites = await favoriteModel.getFavoritesByUserId(userId);
        res.render("pages/favorites", { favorites });
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getFavoritesByUserId, addFavorite, showFavoritesPage };