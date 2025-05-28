const express = require('express');
const router = express.Router();
const marcaRoutes = require('./marca.routes');
const talleRoutes = require('./talle.routes');
const colorRoutes = require('./color.routes');

// Definir rutas base
router.use('/api/marcas', marcaRoutes);
router.use('/api/talles', talleRoutes);
router.use('/api/colores', colorRoutes);

// Ruta de prueba/salud
router.get('/health', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

module.exports = router;

