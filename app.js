const express = require('express');
const session = require('express-session');
const path = require('path');
const routes = require('./routes');
const movieRoutes = require('./routes/movieRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require("./routes/userRoutes");
const flash = require('connect-flash');

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
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));

// Cấu hình flash messages
app.use(flash());

// Middleware để truyền messages và query vào tất cả views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.query = req.query.q || '';
    next();
});

// Middleware để kiểm tra đăng nhập và truyền vào views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session && req.session.user ? true : false;
    res.locals.user = req.session ? req.session.user : null;
    next();
});

// Routes
app.use('/', routes);
app.use('/', movieRoutes);
app.use('/', favoriteRoutes);
app.use('/', userRoutes);

// Error handling
app.use((req, res, next) => {
    res.status(404).render('error', {
        message: 'Không tìm thấy trang'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Đã xảy ra lỗi!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 