const { User, Carrito } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

/**
 * Se obtienen todos los usuarios
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Don't return passwords
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener los usuarios',
            error: error.message 
        });
    }
};

/**
 * Se obtiene un solo usuario con su id
 */
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] } // Don't return password
        });
        
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener el usuario',
            error: error.message 
        });
    }
};

/**
 * Se crea un usuario
 */
const createUser = async (req, res) => {
    try {
        const { nombre, email, password, telefono, is_admin = false } = req.body;
        
        // Se valida que haya nombre, mail y contra
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                message: 'Los campos nombre, email y password son obligatorios' 
            });
        }
        
        // Se valida la estructura del mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'El formato del email no es válido' 
            });
        }
        
        // Se controla que el mail no este ya registrado
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'El email ya está registrado' 
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Se crea el usuario
        const newUser = await User.create({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            is_admin,
            is_authenticated: true
        });
        
        // Se devuelve el usuario sin la contraseña
        const userResponse = {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            telefono: newUser.telefono,
            is_admin: newUser.is_admin,
            is_authenticated: newUser.is_authenticated,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        };
        
        res.status(201).json({
            message: 'Usuario creado correctamente',
            user: userResponse
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ 
            message: 'Error al crear el usuario',
            error: error.message 
        });
    }
};

/**
 * Se actualiza un usuario
 */
const updateUser = async (req, res) => {
    try {
        const { nombre, email, password, telefono, is_admin, is_authenticated } = req.body;
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Se valida la estructura del mail
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'El formato del email no es válido' 
                });
            }
            
            // Se controla que el mail no este ya registrado
            if (email !== user.email) {
                const existingUser = await User.findOne({ 
                    where: { 
                        email,
                        id: { [Op.ne]: req.params.id } // Exclude current user
                    } 
                });
                
                if (existingUser) {
                    return res.status(400).json({ 
                        message: 'El email ya está registrado por otro usuario' 
                    });
                }
            }
        }
        
        // Se prepara los datos del usuario para devolver
        const updateData = {};
        
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (is_admin !== undefined) updateData.is_admin = is_admin;
        if (is_authenticated !== undefined) updateData.is_authenticated = is_authenticated;
        
        // Si se provee contraseña, se hashea
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        
        // Update user
        await user.update(updateData);
        
        // Se obtiene el usuario actualizado sin la contraseña
        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        
        res.json({
            message: 'Usuario actualizado correctamente',
            user: updatedUser
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: error.message });
        }
        
        res.status(500).json({ 
            message: 'Error al actualizar el usuario',
            error: error.message 
        });
    }
};

/**
 * Eliminar usuario
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Se verifica si el usuario tiene algun carrito, si lo tiene se borra
        const carritosAsociados = await Carrito.findOne({ 
            where: { usuario_id: user.id } 
        });
        
        if (carritosAsociados) {
            carritosAsociados.destroy()
        }
        
        await user.destroy();
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al eliminar el usuario',
            error: error.message 
        });
    }
};

/**
 * Login de usuario
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Se valida que se obtenga contraseña y mail
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y password son requeridos' 
            });
        }
        
        // Se encuentra el usuario con el mail
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        // Verificar coincidencia de contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        // Se actualiza el estado de autenticación
        await user.update({ is_authenticated: true }); //vamos a tener que cambiarlo por la autenticacion via mail
        
        // Se preparan los datos SIN CONTRASEÑA
        const userResponse = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono,
            is_admin: user.is_admin,
            is_authenticated: true
        };
        
        res.json({ 
            message: 'Login exitoso', 
            user: userResponse 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error en la autenticación',
            error: error.message 
        });
    }
};

/**
 * Cierre de sesion
 */
const logoutUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        await user.update({ is_authenticated: false });
        
        res.json({ message: 'Logout exitoso' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error en el logout',
            error: error.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser
};
