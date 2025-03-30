const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        req.isAuthenticated = true;
        req.user = req.session.user;
        next();
    } else {
        req.isAuthenticated = false;
        res.redirect('/login');
    }
};

module.exports = {
    isAuthenticated
}; 