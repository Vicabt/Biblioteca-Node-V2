// Supabase table name
const TABLE_NAME = 'loans';

// Loan schema definition (for documentation and validation)
const loanSchema = {
  id: 'uuid', // Supabase uses UUID as primary key
  book_id: {
    type: 'uuid',
    required: true,
    // Foreign key to books table (handled by DB constraint)
  },
  user_id: {
    type: 'uuid',
    required: true,
    // Foreign key to users table (handled by DB constraint)
  },
  loan_date: {
    type: 'timestamp',
    defaultValue: 'NOW()'
  },
  due_date: {
    type: 'timestamp',
    required: true
  },
  return_date: {
    type: 'timestamp',
    nullable: true
  },
  status: {
    type: 'string',
    enum: ['solicitado', 'aprobado', 'rechazado', 'devuelto', 'vencido'],
    defaultValue: 'solicitado',
    required: true
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

// No specific helper functions needed here as Supabase client handles CRUD directly.

module.exports = {
    TABLE_NAME,
    loanSchema
};