// With Supabase, we're using a data access object pattern instead of Mongoose models
const bcrypt = require('bcryptjs');

// Supabase table name
const TABLE_NAME = 'users';

// User schema definition (for documentation and validation)
const userSchema = {
  id: 'uuid', // Supabase uses UUID as primary key
  document_number: { // Added
    type: 'string',
    required: true,
    unique: true,
    maxLength: 20
  },
  full_name: { // Added, replaces username
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 100
  },
  email: {
    type: 'string',
    required: true,
    unique: true,
    format: 'email'
  },
  phone: { // Added
    type: 'string',
    maxLength: 20
  },
  password: {
    type: 'string',
    required: true,
    minLength: 6
  },
  role: {
    type: 'string',
    enum: ['Usuario', 'Administrador', 'Bibliotecario'],
    defaultValue: 'Usuario'
  },
  training: { // Added
    type: 'string',
    maxLength: 100
  },
  ficha_number: { // Added
    type: 'string',
    maxLength: 20
  },
  active: {
    type: 'boolean',
    defaultValue: true
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// Helper functions for user model

// Hash a password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare a password with a hash
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  TABLE_NAME,
  userSchema,
  hashPassword,
  comparePassword
};