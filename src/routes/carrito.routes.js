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
const { verifyToken} = require('../middleware/auth.middleware');

// Obtener o crear el carrito de un usuario
// Importante: Esta ruta debe ir antes de '/:id' para evitar conflictos
router.get('/user/:usuario_id',verifyToken, getUserCart);

// Obtener un carrito específico por ID
router.get('/:id',verifyToken, getCarrito);

// Crear un nuevo carrito
router.post('/',verifyToken, createCarrito);

// Agregar un item al carrito
router.post('/item',verifyToken, addItemToCarrito);

// Actualizar la cantidad de un item en el carrito
router.put('/item',verifyToken, updateCarritoItem);

// Eliminar un item del carrito
router.delete('/:carrito_id/item/:stock_id',verifyToken, removeCarritoItem);

// Eliminar un carrito completo
router.delete('/:id',verifyToken, deleteCarrito);

/* Procesar la compra (checkout) de un carrito
router.post('/:carrito_id/checkout', checkoutCarrito);
*/

module.exports = router;
