const express = require('express');
const PublisherController = require('../controllers/publisherController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all publishers - Accessible to all authenticated users
router.get('/', PublisherController.getPublishers);

// Get a single publisher by ID - Accessible to all authenticated users
router.get('/:id', PublisherController.getPublisherById);

// Create a new publisher - Accessible to Administrador and Bibliotecario
router.post('/', authorizeRoles('Administrador', 'Bibliotecario'), PublisherController.createPublisher);

// Update a publisher by ID - Accessible to Administrador and Bibliotecario
router.put('/:id', authorizeRoles('Administrador', 'Bibliotecario'), PublisherController.updatePublisher);

// Delete a publisher by ID - Accessible to Administrador and Bibliotecario
router.delete('/:id', authorizeRoles('Administrador', 'Bibliotecario'), PublisherController.deletePublisher);

// Toggle publisher state - Accessible to Administrador and Bibliotecario
router.patch('/:id/state', authorizeRoles('Administrador', 'Bibliotecario'), PublisherController.togglePublisherState);

module.exports = router;