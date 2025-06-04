const express = require('express');
const CategoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all categories - Accessible to all authenticated users
router.get('/', CategoryController.getAllCategories);

// Get a single category by ID - Accessible to all authenticated users
router.get('/:id', CategoryController.getCategoryById);

// Create a new category - Accessible to Administrador and Bibliotecario
router.post('/', authorizeRoles('Administrador', 'Bibliotecario'), CategoryController.createCategory);

// Update a category by ID - Accessible to Administrador and Bibliotecario
router.put('/:id', authorizeRoles('Administrador', 'Bibliotecario'), CategoryController.updateCategory);

// Delete a category by ID - Accessible to Administrador and Bibliotecario
router.delete('/:id', authorizeRoles('Administrador', 'Bibliotecario'), CategoryController.deleteCategory);

// Toggle category state - Accessible to Administrador and Bibliotecario
router.patch('/:id/state', authorizeRoles('Administrador', 'Bibliotecario'), CategoryController.toggleCategoryState);

module.exports = router;