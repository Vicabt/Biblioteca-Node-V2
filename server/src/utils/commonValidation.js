/**
 * Common validation utilities to eliminate duplication across controllers
 * Provides reusable validation functions and patterns
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid: boolean, message: string }
 */
const validatePassword = (password) => {
    if (!password || password.length < 6) {
        return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate state field (must be 0 or 1)
 * @param {*} state - State value to validate
 * @returns {boolean} True if valid state
 */
const isValidState = (state) => {
    return state === 0 || state === 1 || state === '0' || state === '1';
};

/**
 * Validate year format (4 digits)
 * @param {*} year - Year to validate
 * @returns {boolean} True if valid year format
 */
const isValidYear = (year) => {
    const yearRegex = /^\d{4}$/;
    return yearRegex.test(year.toString());
};

/**
 * Validate document number format (basic validation)
 * @param {string} documentNumber - Document number to validate
 * @returns {boolean} True if valid format
 */
const isValidDocumentNumber = (documentNumber) => {
    if (!documentNumber || typeof documentNumber !== 'string') return false;
    // Basic validation: at least 6 characters, alphanumeric
    return documentNumber.trim().length >= 6 && /^[a-zA-Z0-9]+$/.test(documentNumber.trim());
};

/**
 * Validate ISBN format (basic validation)
 * @param {string} isbn - ISBN to validate
 * @returns {boolean} True if valid format
 */
const isValidISBN = (isbn) => {
    if (!isbn || typeof isbn !== 'string') return false;
    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    // Check for ISBN-10 (10 digits) or ISBN-13 (13 digits)
    return /^\d{10}$/.test(cleanISBN) || /^\d{13}$/.test(cleanISBN);
};

/**
 * Validate phone number format (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
const isValidPhone = (phone) => {
    if (!phone) return true; // Phone is optional in most cases
    // Basic validation: 7-15 digits, may include +, spaces, hyphens, parentheses
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} True if valid role
 */
const isValidRole = (role) => {
    const validRoles = ['Administrador', 'Bibliotecario', 'Usuario', 'admin', 'user'];
    return validRoles.includes(role);
};

/**
 * Validate loan status
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid status
 */
const isValidLoanStatus = (status) => {
    const validStatuses = ['solicitado', 'aprobado', 'rechazado', 'devuelto', 'atrasado', 'cancelado'];
    return validStatuses.includes(status);
};

/**
 * Validate copy state
 * @param {string} state - Copy state to validate
 * @returns {boolean} True if valid state
 */
const isValidCopyState = (state) => {
    const validStates = ['disponible', 'prestado', 'reservado', 'mantenimiento', 'perdido'];
    return validStates.includes(state);
};

/**
 * Sanitize string input (trim and basic cleanup)
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/\s+/g, ' '); // Trim and replace multiple spaces with single space
};

/**
 * Validate required string field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} minLength - Minimum length (default: 1)
 * @returns {Object} { isValid: boolean, message: string }
 */
const validateRequiredString = (value, fieldName, minLength = 1) => {
    if (!value || typeof value !== 'string' || value.trim().length < minLength) {
        return { 
            isValid: false, 
            message: `${fieldName} es requerido${minLength > 1 ? ` y debe tener al menos ${minLength} caracteres` : ''}` 
        };
    }
    return { isValid: true, message: '' };
};

/**
 * Validate numeric field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {Object} { isValid: boolean, message: string }
 */
const validateNumeric = (value, fieldName, min = null, max = null) => {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
        return { isValid: false, message: `${fieldName} debe ser un número válido` };
    }
    
    if (min !== null && numValue < min) {
        return { isValid: false, message: `${fieldName} debe ser mayor o igual a ${min}` };
    }
    
    if (max !== null && numValue > max) {
        return { isValid: false, message: `${fieldName} debe ser menor o igual a ${max}` };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Validate date format (ISO string or valid date)
 * @param {*} date - Date to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} { isValid: boolean, message: string }
 */
const validateDate = (date, fieldName) => {
    if (!date) {
        return { isValid: false, message: `${fieldName} es requerido` };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return { isValid: false, message: `${fieldName} debe ser una fecha válida` };
    }
    
    return { isValid: true, message: '' };
};

/**
 * Validate entity creation data
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Required field names
 * @returns {Object} { isValid: boolean, errors: Array }
 */
const validateEntityData = (data, requiredFields) => {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push(`${field} es requerido`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Clean and validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} { page: number, limit: number, offset: number }
 */
const validatePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10)); // Max 100, min 1, default 10
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
};

/**
 * Valida si una cadena es una fecha válida en formato YYYY-MM-DD o ISO
 * @param {string} dateString
 * @returns {boolean}
 */
function isValidDate(dateString) {
  // Acepta formato YYYY-MM-DD o YYYY-MM-DDTHH:mm:ssZ
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/.test(dateString);
}

module.exports = {
    isValidEmail,
    validatePassword,
    isValidState,
    isValidYear,
    isValidDocumentNumber,
    isValidISBN,
    isValidPhone,
    isValidRole,
    isValidLoanStatus,
    isValidCopyState,
    sanitizeString,
    validateRequiredString,
    validateNumeric,
    validateDate,
    validateEntityData,
    validatePagination,
    isValidDate,
};
