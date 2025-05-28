const express = require('express');
const router = express.Router();
const {
    getCarrito,
    createCarrito,
    updateCarrito,
    deleteCarrito
}= require('../controllers/carrito.controller');
const { route } = require('./color.routes');

router.get('/:id', getCarrito);
router.post('/', createCarrito);
router.put('/:id', updateCarrito);
router.delete('/:id', deleteCarrito);

module.exports = router;