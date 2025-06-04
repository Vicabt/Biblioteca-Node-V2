const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const authorRoutes = require('./routes/authorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const loanRoutes = require('./routes/loanRoutes'); // Importar rutas de préstamos
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes'); // Importar rutas de usuario
const activityRoutes = require('./routes/activityRoutes');
const errorHandler = require('./middleware/errorHandler');
const { PORT, CORS_ORIGIN } = require('./config/env');
const copyRoutes = require('./routes/copyRoutes');

const supabase = require('./config/supabase');

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/loans', loanRoutes); // Registrar rutas de préstamos
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes); // Registrar rutas de usuario
app.use('/api/activities', activityRoutes);
app.use('/api', copyRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Test Supabase connection
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'success', 
      message: 'Connected to Supabase successfully'
    });
  } catch (error) {
    console.error('Supabase connection error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to Supabase', 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});