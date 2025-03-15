const express = require("express");
const path = require("path");
const db = require("./models/db");
const session = require("express-session");
const app = express();

// Cấu hình EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sử dụng file tĩnh trong "public"
app.use(express.static(path.join(__dirname, "public")));

// Middleware để xử lý JSON request (nếu cần)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Xử lý form POST

app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Sử dụng routes
const homeRoutes = require("./routes/homeRoutes");
const movieRoutes = require("./routes/movieRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/", homeRoutes);
app.use("/", movieRoutes);
app.use("/", favoriteRoutes);
app.use("/", categoryRoutes);
app.use("/", userRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));