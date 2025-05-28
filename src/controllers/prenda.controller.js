const {Prenda} = require('../models');

// Obtener todas las prendas
const getAllPrendas = async (req, res) => {
    try {
        const prendas = await Prenda.findAll();
        res.json(prendas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una prenda por ID
const getPrendaById = async (req, res) => {
    try {
        const prenda = await Prenda.findByPk(req.params.id);
        if (prenda) {
            res.json(prenda);
        } else {
            res.status(404).json({ message: 'Prenda no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Crear una prenda
const createPrenda = async (req, res) => {
    try {
        const prenda = await Prenda.create(req.body);
        res.status(201).json(prenda);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Actualizar una prenda
const updatePrenda = async (req, res) => {
    try {
        const prenda = await Prenda.findByPk(req.params.id);
        if (prenda) {
            await prenda.update(req.body);
            res.json(prenda);   
        } else {
            res.status(404).json({ message: 'Prenda no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Eliminar una prenda
const deletePrenda = async (req, res) => {
    try{
        const prenda= await Prenda.findByPk(req.params.id);
        if (prenda){
            await prenda.destroy();
            res.json({ message: 'Prenda eliminada' });
        } else {
            res.status(404).json({ message: 'Prenda no encontrada' });
        }
    } catch (error){
        res.status(500).json({message: error.message})
    }
}
module.exports ={
    getAllPrendas,
    getPrendaById,
    createPrenda,
    updatePrenda,
    deletePrenda
}