const express = require("express");
const app = express();
const path = require("path");

// Cấu hình EJS hoặc dùng HTML thuần
app.set("view engine", "ejs"); 
app.set("views", path.join(__dirname, "views"));

// Sử dụng file tĩnh trong "public"
app.use(express.static(path.join(__dirname, "public")));

// Sử dụng routes
const homeRoutes = require("./routes/homeRoutes");
app.use("/", homeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
