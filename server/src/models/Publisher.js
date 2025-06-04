// With Supabase, we're using a data access object pattern instead of Mongoose models

// Supabase table name
const TABLE_NAME = 'publishers';

// Publisher schema definition (for documentation and validation)
const publisherSchema = {
  id: 'uuid', // Supabase uses UUID as primary key
  name: {
    type: 'string',
    required: true,
    maxLength: 100
  },
  state: {
    type: 'number',
    enum: [0, 1],
    defaultValue: 1
  },
  created_at: 'timestamp',
  updated_at: 'timestamp'
};

module.exports = {
  TABLE_NAME,
  publisherSchema
};