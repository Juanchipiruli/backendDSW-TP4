const express = require('express');
const router = express.Router();
const {
    getAllPrendas,
    getPrendaById,
    createPrenda,
    updatePrenda,
    deletePrenda
} = require('../controllers/prenda.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Definir las rutas
router.get('/', getAllPrendas);
router.get('/:id', getPrendaById);
router.post('/',verifyToken, isAdmin, createPrenda);
router.put('/:id',verifyToken, isAdmin, updatePrenda);
router.delete('/:id',verifyToken, isAdmin, deletePrenda);

module.exports = router;