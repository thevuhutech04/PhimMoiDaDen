const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout); 

router.get("/api/check-auth", (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated || false,
        user: req.session.user || null
    });
});

module.exports = router;