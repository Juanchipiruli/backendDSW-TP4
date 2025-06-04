const { User, Carrito } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

/**
 * Get all users
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
 * Get a user by ID
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
 * Create a new user
 */
const createUser = async (req, res) => {
    try {
        const { nombre, email, password, telefono, is_admin = false } = req.body;
        
        // Validate required fields
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                message: 'Los campos nombre, email y password son obligatorios' 
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'El formato del email no es válido' 
            });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'El email ya está registrado' 
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create user
        const newUser = await User.create({
            nombre,
            email,
            password: hashedPassword,
            telefono,
            is_admin,
            is_authenticated: true
        });
        
        // Return user without password
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
 * Update an existing user
 */
const updateUser = async (req, res) => {
    try {
        const { nombre, email, password, telefono, is_admin, is_authenticated } = req.body;
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    message: 'El formato del email no es válido' 
                });
            }
            
            // Check if email is taken by another user
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
        
        // Prepare data for update
        const updateData = {};
        
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (is_admin !== undefined) updateData.is_admin = is_admin;
        if (is_authenticated !== undefined) updateData.is_authenticated = is_authenticated;
        
        // If password is provided, hash it
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }
        
        // Update user
        await user.update(updateData);
        
        // Get updated user without password
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
 * Delete a user
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Check if user has any active carts
        const carritosAsociados = await Carrito.findOne({ 
            where: { usuario_id: user.id } 
        });
        
        if (carritosAsociados) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el usuario porque tiene carritos asociados. Elimine primero los carritos.'
            });
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
 * Login a user
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email y password son requeridos' 
            });
        }
        
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
        
        // Update authentication status
        await user.update({ is_authenticated: true });
        
        // Prepare response (without password)
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
 * Logout a user
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
