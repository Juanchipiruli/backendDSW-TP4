const express = require('express');
const router = express.Router();
const {
    getAllTalles,
    getTalleById,
    createTalle,
    updateTalle,
    deleteTalle
} = require('../controllers/talle.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Definir las rutas
router.get('/', getAllTalles);
router.get('/:id', verifyToken, getTalleById);
router.post('/', verifyToken, isAdmin, createTalle);
router.put('/:id',verifyToken, isAdmin, updateTalle);
router.delete('/:id',verifyToken, isAdmin, deleteTalle);

module.exports = router;

