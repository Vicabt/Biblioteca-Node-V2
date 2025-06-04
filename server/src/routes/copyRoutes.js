const express = require('express');
const router = express.Router();
const copyController = require('../controllers/copyController');

// Listar ejemplares de un libro
router.get('/books/:bookId/copies', copyController.listByBook);

// Obtener un ejemplar por id
router.get('/copies/:id', copyController.getOne);

// Crear un ejemplar para un libro
router.post('/books/:bookId/copies', (req, res, next) => {
  req.body.book_id = req.params.bookId;
  copyController.create(req, res, next);
});

// Actualizar un ejemplar
router.put('/copies/:id', copyController.update);

// Cambiar solo el estado de un ejemplar
router.patch('/copies/:id/state', copyController.changeState);

// Eliminar un ejemplar
router.delete('/copies/:id', copyController.remove);

module.exports = router; 