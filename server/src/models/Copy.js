// server/src/models/Copy.js
// Modelo para la tabla de ejemplares (copies) usando Supabase y uuid

const TABLE_NAME = 'copies';

// Esquema de ejemplar para documentación y validación
const copySchema = {
  id: 'uuid', // Clave primaria
  book_id: {
    type: 'uuid',
    required: true,
    // Foreign key a books.id
  },
  code: {
    type: 'string',
    required: true,
    unique: true,
    maxLength: 50
  },
  state: {
    type: 'string',
    enum: ['disponible', 'prestado', 'dañado', 'perdido'],
    defaultValue: 'disponible',
    required: true
  },
  location: {
    type: 'string',
    required: false,
    maxLength: 100
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

module.exports = {
  TABLE_NAME,
  copySchema
}; 