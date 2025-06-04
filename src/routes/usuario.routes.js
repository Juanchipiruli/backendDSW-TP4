const express = require('express');
const router = express.Router();
const {
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/usuario.controller')

router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id',updateUser)
router.delete('/', deleteUser)

module.exports = router;