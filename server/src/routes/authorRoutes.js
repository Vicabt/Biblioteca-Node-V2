const express = require('express');
const AuthorController = require('../controllers/authorController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all authors - Accessible to all authenticated users
router.get('/', AuthorController.getAllAuthors);

// Get a single author by ID - Accessible to all authenticated users
router.get('/:id', AuthorController.getAuthorById);

// Create a new author - Accessible to Administrador and Bibliotecario
router.post('/', authorizeRoles('Administrador', 'Bibliotecario'), AuthorController.createAuthor);

// Update an author by ID - Accessible to Administrador and Bibliotecario
router.put('/:id', authorizeRoles('Administrador', 'Bibliotecario'), AuthorController.updateAuthor);

// Delete an author by ID - Accessible to Administrador and Bibliotecario
router.delete('/:id', authorizeRoles('Administrador', 'Bibliotecario'), AuthorController.deleteAuthor);

// Toggle author state - Accessible to Administrador and Bibliotecario (assuming same roles as delete)
router.patch('/:id/state', authorizeRoles('Administrador', 'Bibliotecario'), AuthorController.toggleAuthorState);

module.exports = router;