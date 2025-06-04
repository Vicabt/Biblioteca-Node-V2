const { body, validationResult } = require('express-validator');

// Middleware to validate request data
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ 
            message: 'Validation error', 
            errors: errors.array() 
        });
    };
};

// Validation rules for login
const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Validation rules for registration
const validateRegister = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email address is required'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Validation rules for authors
const validateAuthor = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('state')
        .optional()
        .isIn([0, 1]).withMessage('State must be 0 or 1')
];

// Validation rules for categories
const validateCategory = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('state')
        .optional()
        .isIn([0, 1]).withMessage('State must be 0 or 1')
];

// Validation rules for publishers
const validatePublisher = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('state')
        .optional()
        .isIn([0, 1]).withMessage('State must be 0 or 1')
];

module.exports = {
    validate,
    validateLogin,
    validateRegister,
    validateAuthor,
    validateCategory,
    validatePublisher
};