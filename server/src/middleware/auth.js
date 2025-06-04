const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { TABLE_NAME } = require('../models/User');
const { JWT_SECRET } = require('../config/env');

// Middleware to authenticate token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // Verify token
        console.log('JWT_SECRET in auth.js:', JWT_SECRET); // Debug log
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user by id from token
        const { data: user, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', decoded.id)
            .single();
        
        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticateToken };