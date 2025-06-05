const express = require('express');
const router = express.Router();
const {
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser
} = require('../controllers/usuario.controller')

router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id',updateUser)
router.delete('/', deleteUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)

module.exports = router;