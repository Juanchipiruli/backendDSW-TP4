const { Color, Stock } = require('../models');

// Obtener todos los colores
const getAllColores = async (req, res) => {
    try {
        const colores = await Color.findAll();
        res.json(colores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un color por ID
const getColorById = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);
        if (color) {
            res.json(color);
        } else {
            res.status(404).json({ message: 'Color no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo color
const createColor = async (req, res) => {
    try {
        const { nombre, codigo_hex } = req.body;
        const nuevoColor = await Color.create({
            nombre,
            codigo_hex
        });
        res.status(201).json(nuevoColor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un color
const updateColor = async (req, res) => {
    try {
        const { nombre, codigo_hex } = req.body;
        const color = await Color.findByPk(req.params.id);
        
        if (color) {
            await color.update({
                nombre: nombre || color.nombre,
                codigo_hex: codigo_hex || color.codigo_hex
            });
            res.json(color);
        } else {
            res.status(404).json({ message: 'Color no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un color
const deleteColor = async (req, res) => {
    try {
        const color = await Color.findByPk(req.params.id);
        if (!color) {
            res.status(404).json({ message: 'Color no encontrado' });
        } else {
            const existingColor = await Stock.findOne({ where: { color_id: req.params.id } }); // Valida que un stock no tenga este color asociado
            if (existingColor) {
                res.status(400).json({ message: 'No se puede eliminar este color porque tiene stock asociado' });
            } else {
                await color.destroy();
                res.json({ message: 'Color eliminado' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllColores,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};

