const express = require('express');
const router = express.Router();
const {
    getUsersbyId,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/usuario.controller')

router.get('/:id', getUsersbyId)
router.post('/', createUser)
router.put('/:id',updateUser)
router.delete('/', deleteUser)