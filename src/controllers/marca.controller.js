const { Marca } = require('../models');

// Obtener todas las marcas
const getAllMarcas = async (req, res) => {
    try {
        const marcas = await Marca.findAll();
        res.json(marcas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una marca por ID
const getMarcaById = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id);
        if (marca) {
            res.json(marca);
        } else {
            res.status(404).json({ message: 'Marca no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear una nueva marca
const createMarca = async (req, res) => {
    try {
        const { nombre, activa } = req.body;
        const nuevaMarca = await Marca.create({
            nombre,
            activa: activa ?? true
        });
        res.status(201).json(nuevaMarca);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar una marca
const updateMarca = async (req, res) => {
    try {
        const { nombre, activa } = req.body;
        const marca = await Marca.findByPk(req.params.id);
        
        if (marca) {
            await marca.update({
                nombre: nombre || marca.nombre,
                activa: activa !== undefined ? activa : marca.activa
            });
            res.json(marca);
        } else {
            res.status(404).json({ message: 'Marca no encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar una marca
const deleteMarca = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id);
        if (marca) {
            await marca.destroy();
            res.json({ message: 'Marca eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Marca no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMarcas,
    getMarcaById,
    createMarca,
    updateMarca,
    deleteMarca
};

