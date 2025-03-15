const categoryModel = require("../models/categoryModel");

// Lấy tất cả thể loại và hiển thị trong view
const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.getAllCategories();
        res.render("categories", { categories: categories });  // Truyền dữ liệu vào view "categories"
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

// Lấy phim theo thể loại và hiển thị trong view
const getMoviesByCategory = async (req, res) => {
    try {
        const movies = await categoryModel.getMoviesByCategory(req.params.categoryId);
        res.render("moviesByCategory", { movies: movies });  // Truyền dữ liệu vào view "moviesByCategory"
    } catch (err) {
        console.error("Lỗi:", err);
        res.status(500).send("Lỗi server");
    }
};

module.exports = { getAllCategories, getMoviesByCategory };
