const { Talle, Stock } = require('../models');

// Obtener todos los talles
const getAllTalles = async (req, res) => {
    try {
        const talles = await Talle.findAll();
        res.json(talles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un talle por ID
const getTalleById = async (req, res) => {
    try {
        const talle = await Talle.findByPk(req.params.id);
        if (talle) {
            res.json(talle);
        } else {
            res.status(404).json({ message: 'Talle no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo talle
const createTalle = async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevoTalle = await Talle.create({ nombre });
        res.status(201).json(nuevoTalle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un talle
const updateTalle = async (req, res) => {
    try {
        const { nombre } = req.body;
        const talle = await Talle.findByPk(req.params.id);
        
        if (talle) {
            await talle.update({ nombre });
            res.json(talle);
        } else {
            res.status(404).json({ message: 'Talle no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un talle
const deleteTalle = async (req, res) => {
    try {
        const talle = await Talle.findByPk(req.params.id);
        if (!talle) {
            res.status(404).json({ message: 'Talle no encontrado' });
        } else {
            const existingTalle = await Stock.findOne({ where: { talle_id: req.params.id } }); // Valida que un stock no tenga este talle asociado
            if (existingTalle) {
                return res.status(400).json({ message: 'No se puede eliminar el talle porque está asociado a un stock' });
            }else{
                await talle.destroy();
                res.json({ message: 'Talle eliminado correctamente', talle: talle });
            }
            
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTalles,
    getTalleById,
    createTalle,
    updateTalle,
    deleteTalle
};

