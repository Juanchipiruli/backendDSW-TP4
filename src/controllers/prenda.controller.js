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
        const {nombre,  descripcion, precio, imagenes, colores} = req.body;
        const nuevaPrenda = {
            nombre,
            descripcion,
            precio,
            imagenes,
            colores
        }

        // ver que hacer con la marca ya que es una FK

        res.status(201).json(nuevaPrenda);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Actualizar una prenda
const updatePrenda = async (req, res) => {
    try {
        const {nombre,  descripcion, precio, imagenes, colores} = req.body;
        const prenda = await Prenda.findByPk(req.params.id);
        if (prenda) {
            await prenda.update({
                nombre: nombre || prenda.nombre,
                descripcion: descripcion || prenda.descripcion,
                precio: precio || prenda.precio,
                imagenes: imagenes || prenda.imagenes,
                colores: colores || prenda.colores
            });

            // ver que hacer con la marca ya que es una FK
            
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