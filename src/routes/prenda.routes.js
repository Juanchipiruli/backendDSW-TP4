const express = require('express');
const router = express.Router();
const {
    getAllPrendas,
    getPrendaById,
    createPrenda,
    updatePrenda,
    deletePrenda
} = require('../controllers/prenda.controller');

// Definir las rutas
router.get('/', getAllPrendas);
router.get('/:id', getPrendaById);
router.post('/', createPrenda);
router.put('/:id', updatePrenda);
router.delete('/:id', deletePrenda);

module.exports = router;