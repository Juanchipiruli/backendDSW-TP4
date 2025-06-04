const express = require('express');
const router = express.Router();
const marcaRoutes = require('./marca.routes');
const talleRoutes = require('./talle.routes');
const colorRoutes = require('./color.routes');
const prendaRoutes = require('./prenda.routes');
const userRoutes = require('./usuario.routes');
const stockRoutes = require('./stock.routes');
const carritoRoutes = require('./carrito.routes');

// Definir rutas base
router.use('/api/marcas', marcaRoutes);
router.use('/api/talles', talleRoutes);
router.use('/api/colores', colorRoutes);
router.use('/api/prendas', prendaRoutes);
router.use('/api/users', userRoutes);
router.use('/api/stocks', stockRoutes);
router.use('/api/carritos', carritoRoutes);

// Ruta de prueba/salud
router.get('/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = router;

