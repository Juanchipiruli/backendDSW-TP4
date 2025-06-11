const express = require('express');
const router = express.Router();
const {
    getAllColores,
    getColorById,
    createColor,
    updateColor,
    deleteColor
} = require('../controllers/color.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas publicas
router.get('/', getAllColores);
router.get('/:id', getColorById);
// Rutas admin
router.post('/',verifyToken, isAdmin, createColor);
router.put('/:id',verifyToken, isAdmin, updateColor);
router.delete('/:id',verifyToken, isAdmin, deleteColor);

module.exports = router;

