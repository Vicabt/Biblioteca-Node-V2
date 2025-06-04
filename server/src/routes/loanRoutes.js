const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/authorization');

// Aplicar middleware de autenticación a todas las rutas de préstamos
router.use(authenticateToken);

// Rutas para Usuarios
router.post('/request', authorizeRoles('Usuario', 'Administrador', 'Bibliotecario'), loanController.requestLoan);
router.get('/my-loans', authorizeRoles('Usuario'), loanController.getUserLoans);

// Rutas para Bibliotecarios y Administradores
// All loan updates now use the consolidated updateLoan function
router.put('/:id/status', authorizeRoles('Bibliotecario', 'Administrador'), loanController.updateLoan);
router.put('/:id', authorizeRoles('Bibliotecario', 'Administrador'), loanController.updateLoan);
router.put('/:id/return', authorizeRoles('Bibliotecario', 'Administrador'), loanController.updateLoan);

// Ruta para Administradores y Bibliotecarios para ver todos los préstamos
router.get('/', authorizeRoles('Administrador', 'Bibliotecario'), loanController.getAllLoans);

// Ruta para eliminar un préstamo
router.delete('/:id', authorizeRoles('Administrador', 'Bibliotecario'), loanController.deleteLoan);

module.exports = router;