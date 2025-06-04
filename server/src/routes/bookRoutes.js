const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todos los libros - Accesible a todos los usuarios autenticados
router.get('/', bookController.getAllBooks);

// Obtener un libro por ID - Accesible a todos los usuarios autenticados
router.get('/:id', bookController.getBookById);

// Crear un nuevo libro - Accesible a Administrador y Bibliotecario
router.post('/', authorizeRoles('Administrador', 'Bibliotecario'), bookController.createBook);

// Actualizar un libro existente - Accesible a Administrador y Bibliotecario
router.put('/:id', authorizeRoles('Administrador', 'Bibliotecario'), bookController.updateBook);

// Eliminar un libro - Accesible a Administrador y Bibliotecario
router.delete('/:id', authorizeRoles('Administrador', 'Bibliotecario'), bookController.deleteBook);

// Cambiar estado de un libro - Accesible a Administrador y Bibliotecario
router.patch('/:id/state', authorizeRoles('Administrador', 'Bibliotecario'), bookController.toggleBookState);

// Obtener libros inactivos - Accesible solo a Administrador
router.get('/status/inactive', authorizeRoles('Administrador'), bookController.getInactiveBooks);

module.exports = router;