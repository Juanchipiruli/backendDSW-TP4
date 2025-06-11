const express = require('express');
const router = express.Router();
const {
    getAllMarcas,
    getMarcaById,
    createMarca,
    updateMarca,
    deleteMarca
} = require('../controllers/marca.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Definir las rutas
router.get('/', getAllMarcas);
router.get('/:id', getMarcaById);
router.post('/',verifyToken, isAdmin, createMarca);
router.put('/:id',verifyToken, isAdmin, updateMarca);
router.delete('/:id',verifyToken, isAdmin, deleteMarca);

module.exports = router;

