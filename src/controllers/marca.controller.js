const { Marca, Prenda } = require('../models');

// Obtener todas las marcas
const getAllMarcas = async (req, res) => {
    try {
        const marcas = await Marca.findAll();
        res.json(marcas);
    } catch (error) { // Devolvemos error si algo sale mal
        res.status(500).json({ message: error.message });
    }
};

// Obtener una marca por su ID
const getMarcaById = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id);
        if (marca) {
            res.json(marca);
        } else { // Si no se encuentra la marca
            res.status(404).json({ message: 'Marca no encontrada' });
        }
    } catch (error) { // Devolvemos error si algo sale mal
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
    } catch (error) { // Devolvemos error si algo sale mal
        res.status(400).json({ message: error.message });
    }
};

// Actualizar una marca
const updateMarca = async (req, res) => {
    try {
        const { nombre, activa } = req.body; // Obtenemos los datos de la petición
        const marca = await Marca.findByPk(req.params.id); // Obtenemos la marca por su id
        
        if (marca) {
            await marca.update({ // Actualizamos la marca
                nombre: nombre || marca.nombre,
                activa: activa !== undefined ? activa : marca.activa
            });
            res.json(marca);
        } else {
            res.status(404).json({ message: 'Marca no encontrada' }); // Si no se encuentra la marca
        }
    } catch (error) { // Devolvemos error si algo sale mal
        res.status(400).json({ message: error.message });
    }
};

// Eliminar una marca
const deleteMarca = async (req, res) => {
    try {
        const marca = await Marca.findByPk(req.params.id); // Obtenemos una marca por su id
        if (marca) {
            
            // Verificar si la marca está siendo usada por alguna prenda
            const prendasConMarca = await Prenda.count({
                where: { marca_id: req.params.id }
            });
            
            if (prendasConMarca > 0) {
                res.status(400).json({ 
                    message: `No se puede eliminar la marca porque está siendo utilizada por ${prendasConMarca} prenda(s)` 
                });
                return;
            }
            
            await marca.destroy(); // Eliminamos la marca
            res.json({ message: 'Marca eliminada correctamente' });
        } else {
            res.status(404).json({ message: 'Marca no encontrada' }); // Si no se encuentra la marca
        }
    } catch (error) { // Devolvemos error si algo sale mal
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

