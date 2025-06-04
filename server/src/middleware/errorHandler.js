const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    
    // Default error status and message
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    // Custom error responses based on error type
    if (err.name === 'ValidationError') {
        // Mongoose validation error
        return res.status(400).json({
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    } else if (err.name === 'CastError') {
        // Mongoose cast error (invalid ID)
        return res.status(400).json({
            message: 'Invalid ID format'
        });
    } else if (err.code === 11000) {
        // Mongoose duplicate key error
        return res.status(409).json({
            message: 'Duplicate key error',
            field: err.keyValue
        });
    }
    
    // General error response
    res.status(status).json({
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;