const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');

// Crear nuevo stock
router.post('/', stockController.createStock);

// Actualizar stock existente
router.put('/:id', stockController.updateStock);

// Obtener stock por producto
router.get('/product/:id', stockController.getStockByProduct);

// Verificar disponibilidad
router.post('/check-availability', stockController.checkAvailability);

// Actualizar disponibilidad
router.put('/:id/availability', stockController.updateAvailability);

// Obtener todo el stock
router.get('/', stockController.getAllStock);

module.exports = router;

