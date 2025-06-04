const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const supabase = require('../config/supabase');
const { TABLE_NAME, hashPassword, comparePassword } = require('../models/User');
const { sendSuccess, sendError, sendValidationError, sendNotFound, handleSupabaseError, asyncHandler, validateRequiredFields, HTTP_STATUS } = require('../utils/responseHelper');
const { isValidEmail } = require('../utils/commonValidation');

// Controller for user login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields({ email, password }, ['email', 'password']);
    if (missingFields.length > 0) {
        return sendValidationError(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Invalid email format');
    }
    
    console.log(`Login attempt for email: ${email}`);
    console.log('Attempting to query Supabase for user...');

    // Find user by email
    const { data: user, error: dbError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('email', email)
        .single();

    console.log('Supabase query completed.');
    if (dbError) {
        console.error('Supabase error during login (querying user):', JSON.stringify(dbError, null, 2));
        return handleSupabaseError(res, dbError, 'Error querying user database');
    }

    if (!user) {
        console.log(`Login failed: User not found for email: ${email}`);
        return sendValidationError(res, 'Invalid email or password');
    }
    
    console.log(`User found: ${user.email}, ID: ${user.id}, Active: ${user.active}`);

    // Check if user is active
    if (!user.active) {
        console.log(`Login failed: User ${user.email} is inactive.`);
        return sendError(res, 'Your account has been deactivated', 403);
    }
    
    // Check for presence of password hash
    if (!user.password) {
        console.error(`Critical: User ${user.email} (ID: ${user.id}) has no password hash stored.`);
        return sendError(res, 'Account configuration error. Please contact support.', 500);
    }

    // Check password
    console.log(`Comparing password for user: ${user.email}`);
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        console.log(`Login failed: Invalid password for user: ${user.email}`);
        return sendValidationError(res, 'Invalid email or password');
    }
    console.log(`Password valid for user: ${user.email}`);
    
    // Check for necessary fields for JWT
    if (!user.id || !user.role) {
        console.error(`Critical: User ${user.email} (ID: ${user.id}) is missing ID or role for JWT generation. ID: ${user.id}, Role: ${user.role}`);
        return sendError(res, 'Account data incomplete. Please contact support.', 500);
    }

    // Generate JWT token
    console.log(`Generating JWT for user: ${user.id}, role: ${user.role}`);
    const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    console.log(`JWT generated successfully for user: ${user.id}`);
    
    // Send response with token and user data (excluding password)
    const userData = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        active: user.active, // Added active status
        document_number: user.document_number,
        phone: user.phone, // Added phone
        training: user.training, // Added training
        ficha_number: user.ficha_number // Added ficha_number
    };
    
    sendSuccess(res, { token, user: userData }, HTTP_STATUS.OK, 'Login successful');
});

// Controller for user registration
const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    
    // Validate required fields
    const missingFields = validateRequiredFields({ username, email, password }, ['username', 'email', 'password']);
    if (missingFields.length > 0) {
        return sendValidationError(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Invalid email format');
    }
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
        .from(TABLE_NAME)
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();
    
    if (existingUser) {
        const conflictField = existingUser.email === email ? 'email' : 'username';
        return sendError(res, `User with this ${conflictField} already exists`, 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const { data: newUser, error: createError } = await supabase
        .from(TABLE_NAME)
        .insert({
            username,
            email,
            password: hashedPassword,
            role: 'user',
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (createError) {
        return handleSupabaseError(res, createError, 'Error creating user account');
    }
    
    const userData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
    };
    
    sendSuccess(res, { user: userData }, HTTP_STATUS.CREATED, 'User registered successfully');
});

// Controller for user logout (client-side logout, just for API completion)
const logout = (req, res) => {
    sendSuccess(res, null, HTTP_STATUS.OK, 'Logout successful');
};

module.exports = {
    login,
    register,
    logout
};