const express = require('express');
const router = express.Router();
const {
    getAllColores,
    getColorById,
    createColor,
    updateColor,
    deleteColor
} = require('../controllers/color.controller');

// Definir las rutas
router.get('/', getAllColores);
router.get('/:id', getColorById);
router.post('/', createColor);
router.put('/:id', updateColor);
router.delete('/:id', deleteColor);

module.exports = router;

