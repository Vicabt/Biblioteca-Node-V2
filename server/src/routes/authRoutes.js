const express = require('express');
const { login, register, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');
const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', authenticateToken, authorizeRoles('Administrador'), register);

// Protected routes
router.get('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, (req, res) => {
    // Return user info (excluding password)
    const { _id, username, email, role } = req.user;
    res.status(200).json({
        id: _id,
        username,
        email,
        role
    });
});

module.exports = router;