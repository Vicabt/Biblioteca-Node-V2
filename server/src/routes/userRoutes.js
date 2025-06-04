const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');

// Ruta para obtener el perfil del usuario (protegida)
router.get('/profile', authenticateToken, userController.getUserProfile);

// Ruta para actualizar el perfil del usuario (protegida)
router.put('/profile', authenticateToken, userController.updateUserProfile);

// Gestión de usuarios (solo admin)
router.get('/', authenticateToken, authorizeRoles('Administrador'), userController.listUsers);
router.post('/', authenticateToken, authorizeRoles('Administrador'), userController.createUser);
router.put('/:id', authenticateToken, authorizeRoles('Administrador'), userController.updateUser);
router.patch('/:id/active', authenticateToken, authorizeRoles('Administrador'), userController.toggleUserActive);

// Ruta para restablecer la contraseña de un usuario (solo admin)
router.put('/reset-password/:id', authenticateToken, authorizeRoles('Administrador'), userController.resetUserPassword);

module.exports = router;