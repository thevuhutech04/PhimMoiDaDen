const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');

const app = express();

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using HTTPS
}));

// Routes
app.use('/', routes);
const userRoutes = require("./routes/userRoutes");

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Không tìm thấy trang');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã xảy ra lỗi!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 