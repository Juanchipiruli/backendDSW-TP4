const express = require('express');
const router = express.Router();
const {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser
} = require('../controllers/usuario.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', loginUser);
router.post('/', createUser); // Registro de usuario

// Rutas protegidas
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser); // Solo admin puede eliminar usuarios
router.get('/logout', verifyToken, logoutUser);

module.exports = router;