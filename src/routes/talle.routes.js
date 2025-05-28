const express = require('express');
const router = express.Router();
const {
    getAllTalles,
    getTalleById,
    createTalle,
    updateTalle,
    deleteTalle
} = require('../controllers/talle.controller');

// Definir las rutas
router.get('/', getAllTalles);
router.get('/:id', getTalleById);
router.post('/', createTalle);
router.put('/:id', updateTalle);
router.delete('/:id', deleteTalle);

module.exports = router;

