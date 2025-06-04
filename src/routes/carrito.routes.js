const express = require('express');
const router = express.Router();
const {
    getCarrito,
    getUserCart,
    createCarrito,
    addItemToCarrito,
    updateCarritoItem,
    removeCarritoItem,
    deleteCarrito,
    checkoutCarrito
} = require('../controllers/carrito.controller');

// Obtener o crear el carrito de un usuario
// Importante: Esta ruta debe ir antes de '/:id' para evitar conflictos
router.get('/user/:usuario_id', getUserCart);

// Obtener un carrito específico por ID
router.get('/:id', getCarrito);

// Crear un nuevo carrito
router.post('/', createCarrito);

// Agregar un item al carrito
router.post('/item', addItemToCarrito);

// Actualizar la cantidad de un item en el carrito
router.put('/item', updateCarritoItem);

// Eliminar un item del carrito
router.delete('/:carrito_id/item/:stock_id', removeCarritoItem);

// Eliminar un carrito completo
router.delete('/:id', deleteCarrito);

// Procesar la compra (checkout) de un carrito
router.post('/:carrito_id/checkout', checkoutCarrito);

module.exports = router;
