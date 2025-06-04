const User = require('../models/User');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { TABLE_NAME } = require('../models/User');
const { sendSuccess, sendError, sendNotFound, sendValidationError, handleSupabaseError, asyncHandler, validateRequiredFields, HTTP_STATUS } = require('../utils/responseHelper');
const { isValidEmail, isValidPhone, isValidDocumentNumber, sanitizeString } = require('../utils/commonValidation');

// Obtener perfil de usuario
exports.getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    return sendError(res, 'Usuario no encontrado o token inválido', 404);
  }

  const { data: userProfile, error } = await supabase
    .from(TABLE_NAME)
    .select('id, email, role, active, document_number, full_name, phone, training, ficha_number, created_at, updated_at')
    .eq('id', req.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile from Supabase:', error);
    return handleSupabaseError(res, error, 'Error al obtener el perfil del usuario');
  }

  if (!userProfile) {
    return sendNotFound(res, 'Perfil de usuario no encontrado');
  }
  
  sendSuccess(res, userProfile, HTTP_STATUS.OK, 'Perfil obtenido exitosamente');
});

// Actualizar perfil de usuario
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // Destructure all updatable fields from schema, removing 'username'
  const { email, password, full_name, document_number, phone, training, ficha_number } = req.body;

  const updateData = {};

  // Validate and sanitize fields
  if (email) {
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Formato de email inválido');
    }
    updateData.email = email;
  }
  
  if (full_name) {
    updateData.full_name = sanitizeString(full_name);
  }
  
  if (document_number) {
    if (!isValidDocumentNumber(document_number)) {
      return sendValidationError(res, 'Número de documento inválido');
    }
    updateData.document_number = document_number;
  }
  
  if (phone) {
    if (!isValidPhone(phone)) {
      return sendValidationError(res, 'Número de teléfono inválido');
    }
    updateData.phone = phone;
  }
  
  if (training) {
    updateData.training = sanitizeString(training);
  }
    if (ficha_number) {
    updateData.ficha_number = sanitizeString(ficha_number);
  }
  
  // If password is provided, hash it
  if (password) {
    if (password.length < 6) {
      return sendValidationError(res, 'La contraseña debe tener al menos 6 caracteres');
    }
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt); // Supabase uses 'password' column for auth
  }
  
  updateData.updated_at = new Date().toISOString();

  if (Object.keys(updateData).length === 1 && updateData.updated_at) {
      return sendValidationError(res, 'No se proporcionaron datos para actualizar');
  }

  const { data: updatedUser, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', userId)
    .select('id, email, role, active, document_number, full_name, phone, training, ficha_number, created_at, updated_at') // Select all relevant fields
    .single();

  if (error) {
    console.error('Error updating user profile in Supabase:', error);
    // Handle specific Supabase errors, e.g., unique constraint violations
    if (error.code === '23505') { // Unique violation
      if (error.message.includes('users_email_key')) {
        return sendError(res, 'El correo electrónico ya está en uso', 409);      }
      if (error.message.includes('users_document_number_key')) {
        return sendError(res, 'El número de documento ya está en uso', 409);
      }
    }
    return handleSupabaseError(res, error, 'Error al actualizar el perfil del usuario');
  }

  if (!updatedUser) {
    return sendNotFound(res, 'Usuario no encontrado después de la actualización');
  }

  sendSuccess(res, { user: updatedUser }, HTTP_STATUS.OK, 'Perfil actualizado correctamente');
});

// Listar todos los usuarios (solo admin)
exports.listUsers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, document_number, full_name, email, phone, role, training, ficha_number, active, created_at, updated_at'); // Added new fields, replaced username with full_name
  
  if (error) {
    return handleSupabaseError(res, error, 'Error al obtener usuarios');
  }
  
  sendSuccess(res, data, HTTP_STATUS.OK, 'Usuarios obtenidos exitosamente');
});

// Crear usuario (solo admin)
exports.createUser = asyncHandler(async (req, res) => {
  const { document_number, full_name, email, phone, password, role, training, ficha_number, active } = req.body; // Added new fields, replaced username with full_name
  
  // Validate required fields
  const missingFields = validateRequiredFields(
    { document_number, full_name, email, password, role }, 
    ['document_number', 'full_name', 'email', 'password', 'role']
  );
  if (missingFields.length > 0) {
    return sendValidationError(res, `Campos obligatorios faltantes: ${missingFields.join(', ')}`);
  }

  // Validate field formats
  if (!isValidEmail(email)) {
    return sendValidationError(res, 'Formato de email inválido');
  }
  
  if (!isValidDocumentNumber(document_number)) {
    return sendValidationError(res, 'Número de documento inválido');
  }
  
  if (phone && !isValidPhone(phone)) {
    return sendValidationError(res, 'Número de teléfono inválido');
  }

  // Verificar si ya existe usuario por email o número de documento
  const { data: existing, error: checkError } = await supabase
    .from(TABLE_NAME)
    .select('id')
    .or(`email.eq.${email},document_number.eq.${document_number}`)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found, which is good here
      console.error('Error checking existing user:', checkError);
      return handleSupabaseError(res, checkError, 'Error al verificar usuario existente');
  }
  
  if (existing) {
    return sendError(res, 'El email o número de documento ya existe', 409);
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    document_number,
    full_name: sanitizeString(full_name),
    email,
    phone: phone ? sanitizeString(phone) : undefined,
    password: hashedPassword,
    role,
    training: training ? sanitizeString(training) : undefined,
    ficha_number: ficha_number ? sanitizeString(ficha_number) : undefined,
    active: active !== undefined ? active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Remove undefined optional fields
  Object.keys(newUser).forEach(key => newUser[key] === undefined && delete newUser[key]);

  const { data: user, error } = await supabase
    .from(TABLE_NAME)
    .insert(newUser)
    .select()
    .single();
    
  if (error) {
    return handleSupabaseError(res, error, 'Error al crear usuario');  }
  
  sendSuccess(res, user, HTTP_STATUS.CREATED, 'Usuario creado exitosamente');
});

// Editar usuario (solo admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { document_number, full_name, email, phone, role, training, ficha_number, active } = req.body;
  
  const updateData = {};
  
  // Validate and sanitize fields
  if (document_number !== undefined) {
    if (!isValidDocumentNumber(document_number)) {
      return sendValidationError(res, 'Número de documento inválido');
    }
    updateData.document_number = document_number;
  }
  
  if (full_name !== undefined) {
    updateData.full_name = sanitizeString(full_name);
  }
  
  if (email !== undefined) {
    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Formato de email inválido');
    }
    updateData.email = email;
  }
  
  if (phone !== undefined) {
    if (phone && !isValidPhone(phone)) {
      return sendValidationError(res, 'Número de teléfono inválido');
    }
    updateData.phone = phone;
  }
  
  if (role !== undefined) {
    updateData.role = role;
  }
  
  if (training !== undefined) {
    updateData.training = training ? sanitizeString(training) : training;
  }
  
  if (ficha_number !== undefined) {
    updateData.ficha_number = ficha_number ? sanitizeString(ficha_number) : ficha_number;
  }
  
  if (active !== undefined) {
    updateData.active = active;
  }
  
  updateData.updated_at = new Date().toISOString();

  if (Object.keys(updateData).length === 1 && updateData.updated_at) {
    return sendValidationError(res, 'No se proporcionaron datos para actualizar');
  }

  const { data: user, error } = await supabase
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Handle specific Supabase errors
    if (error.code === '23505') { // Unique violation
      if (error.message.includes('users_email_key')) {
        return sendError(res, 'El correo electrónico ya está en uso por otro usuario', 409);
      }
      if (error.message.includes('users_document_number_key')) {
        return sendError(res, 'El número de documento ya está en uso por otro usuario', 409);
      }
    }
    return handleSupabaseError(res, error, 'Error al actualizar usuario');
  }

  if (!user) {
    return sendNotFound(res, 'Usuario no encontrado');
  }

  sendSuccess(res, user, HTTP_STATUS.OK, 'Usuario actualizado exitosamente');
});

// Activar/desactivar usuario (solo admin)
exports.toggleUserActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  
  if (active === undefined) {
    return sendValidationError(res, 'El campo "active" es requerido');
  }
  
  const { data: user, error } = await supabase
    .from(TABLE_NAME)
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return handleSupabaseError(res, error, 'Error al cambiar estado del usuario');
  }
  
  if (!user) {
    return sendNotFound(res, 'Usuario no encontrado');
  }
  
  sendSuccess(res, user, HTTP_STATUS.OK, `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`);
});

// Restablecer contraseña de usuario (solo admin)
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const missingFields = validateRequiredFields({ password }, ['password']);
  if (missingFields.length > 0) {
    return sendValidationError(res, 'La nueva contraseña es requerida');
  }

  if (password.length < 6) {
    return sendValidationError(res, 'La nueva contraseña debe tener al menos 6 caracteres');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { data: updatedUser, error } = await supabase
    .from(TABLE_NAME)
    .update({ 
      password: hashedPassword,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, email, role')
    .single();

  if (error) {
    return handleSupabaseError(res, error, 'Error al restablecer la contraseña del usuario');
  }

  if (!updatedUser) {
    return sendNotFound(res, 'Usuario no encontrado');
  }

  sendSuccess(res, { 
    message: 'Contraseña restablecida correctamente', 
    user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role } 
  }, HTTP_STATUS.OK, 'Contraseña restablecida exitosamente');
});

module.exports = exports;