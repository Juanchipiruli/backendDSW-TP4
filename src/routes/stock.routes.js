const express = require('express');
const router = express.Router();
const {
    createStock,
    updateStock,
    getStockByProduct,
    checkAvailability,
    updateAvailability,
    getAllStock
} = require('../controllers/stock.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Crear nuevo stock
router.post('/',verifyToken, isAdmin , createStock);

// Actualizar stock existente
router.put('/:id',verifyToken, isAdmin, updateStock);

// Obtener stock por prenda
router.get('/product/:id',verifyToken, getStockByProduct);

// Verificar disponibilidad
router.post('/check-availability',verifyToken, checkAvailability);

// Actualizar disponibilidad
router.put('/:id/availability',verifyToken, isAdmin, updateAvailability);

// Obtener todo el stock
router.get('/',verifyToken, isAdmin, getAllStock);

module.exports = router;

