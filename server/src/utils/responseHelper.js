/**
 * Shared response utilities to eliminate code duplication across controllers
 * Provides consistent response formatting and status handling
 */

/**
 * Standard HTTP status codes used throughout the application
 */
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Common error messages
 */
const ERROR_MESSAGES = {
    INTERNAL_SERVER_ERROR: 'Error interno del servidor',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION_ERROR: 'Error de validación',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    CONFLICT: 'Recurso ya existe',
    BAD_REQUEST: 'Solicitud inválida'
};

/**
 * Send success response with data
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 */
const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK, message = null) => {
    const response = { success: true };
    
    if (message) response.message = message;
    if (data !== undefined) response.data = data;
    
    res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Additional error details
 */
const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) => {
    const response = { 
        success: false, 
        message 
    };
    
    if (error && process.env.NODE_ENV === 'development') {
        response.error = error;
    }
    
    console.error(`Error ${statusCode}: ${message}`, error || '');
    res.status(statusCode).json(response);
};

/**
 * Send not found error
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name (e.g., 'Author', 'Book')
 */
const sendNotFound = (res, resource = 'Recurso') => {
    sendError(res, `${resource} no encontrado`, HTTP_STATUS.NOT_FOUND);
};

/**
 * Send validation error
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Validation errors
 */
const sendValidationError = (res, errors) => {
    const message = Array.isArray(errors) ? errors.join(', ') : errors;
    sendError(res, message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Send conflict error (duplicate resource)
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 */
const sendConflict = (res, message = ERROR_MESSAGES.CONFLICT) => {
    sendError(res, message, HTTP_STATUS.CONFLICT);
};

/**
 * Send unauthorized error
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendUnauthorized = (res, message = ERROR_MESSAGES.UNAUTHORIZED) => {
    sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Send forbidden error
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 */
const sendForbidden = (res, message = ERROR_MESSAGES.FORBIDDEN) => {
    sendError(res, message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Handle Supabase error and send appropriate response
 * @param {Object} res - Express response object
 * @param {Object} error - Supabase error object
 * @param {string} operation - Operation that failed (e.g., 'creating user')
 */
const handleSupabaseError = (res, error, operation = 'processing request') => {
    console.error(`Supabase error during ${operation}:`, error);
    
    // Handle specific Supabase error codes
    if (error.code === 'PGRST204') {
        return sendNotFound(res);
    }
    
    if (error.code === '23505') { // Unique constraint violation
        return sendConflict(res, 'El recurso ya existe o viola una restricción única');
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
        return sendError(res, 'Operación no permitida: referencias existentes', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Generic server error
    sendError(res, `Error al ${operation}`, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
};

/**
 * Wrap async controller functions to handle errors automatically
 * @param {Function} fn - Async controller function
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error('Unhandled error in controller:', error);
            sendError(res, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        });
    };
};

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Array} Array of missing fields
 */
const validateRequiredFields = (body, requiredFields) => {
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
            missingFields.push(field);
        }
    });
    
    return missingFields;
};

/**
 * Send missing fields validation error
 * @param {Object} res - Express response object
 * @param {Array} missingFields - Array of missing field names
 */
const sendMissingFieldsError = (res, missingFields) => {
    const fieldNames = missingFields.join(', ');
    sendValidationError(res, `Los siguientes campos son requeridos: ${fieldNames}`);
};

module.exports = {
    HTTP_STATUS,
    ERROR_MESSAGES,
    sendSuccess,
    sendError,
    sendNotFound,
    sendValidationError,
    sendConflict,
    sendUnauthorized,
    sendForbidden,
    handleSupabaseError,
    asyncHandler,
    validateRequiredFields,
    sendMissingFieldsError
};
