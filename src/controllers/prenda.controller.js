const {Prenda, Marca} = require('../models');

// Obtener todas las prendas
const getAllPrendas = async (req, res) => {
    try {
        const prendas = await Prenda.findAll({
            include: [{ model: Marca, attributes: ['id', 'nombre'] }]
        });
        res.json(prendas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una prenda por ID
const getPrendaById = async (req, res) => {
    try {
        const prenda = await Prenda.findByPk(req.params.id, {
            include: [{ model: Marca, attributes: ['id', 'nombre'] }]
        });
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
        // Extraer los datos del cuerpo de la solicitud
        const {nombre, descripcion, marca_id, precio, imagenes} = req.body;
        
        // Validar campos obligatorios
        if (!nombre || !marca_id || !precio) {
            return res.status(400).json({ message: 'Los campos nombre, marca_id y precio son obligatorios' });
        }

        // Validar que la marca existe
        const marcaExiste = await Marca.findByPk(marca_id);
        if (!marcaExiste) {
            return res.status(404).json({ message: 'La marca especificada no existe' });
        }
        
        // Crear la prenda en la base de datos
        const nuevaPrenda = await Prenda.create({
            nombre,
            descripcion,
            marca_id,
            precio,
            imagenes
        });
        
        // Obtener la prenda creada con su relación a marca
        const prendaConRelaciones = await Prenda.findByPk(nuevaPrenda.id, {
            include: [{ model: Marca, attributes: ['id', 'nombre'] }]
        });
        
        res.status(201).json(prendaConRelaciones);
    } catch (error) {
        // Manejar errores específicos
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al crear la prenda', error: error.message });
    }
};
// Actualizar una prenda
const updatePrenda = async (req, res) => {
    try {
        const {nombre, descripcion, marca_id, precio, imagenes} = req.body;
        
        // Validar que la prenda existe
        const prenda = await Prenda.findByPk(req.params.id);
        if (!prenda) {
            return res.status(404).json({ message: 'Prenda no encontrada' });
        }
        
        // Si se proporciona marca_id, validar que la marca existe
        if (marca_id) {
            const marcaExiste = await Marca.findByPk(marca_id);
            if (!marcaExiste) {
                return res.status(404).json({ message: 'La marca especificada no existe' });
            }
        }
        
        // Actualizar la prenda
        await prenda.update({
            nombre: nombre !== undefined ? nombre : prenda.nombre,
            descripcion: descripcion !== undefined ? descripcion : prenda.descripcion,
            marca_id: marca_id !== undefined ? marca_id : prenda.marca_id,
            precio: precio !== undefined ? precio : prenda.precio,
            imagenes: imagenes !== undefined ? imagenes : prenda.imagenes
        });
        
        // Obtener la prenda actualizada con su relación a marca
        const prendaActualizada = await Prenda.findByPk(prenda.id, {
            include: [{ model: Marca, attributes: ['id', 'nombre'] }]
        });
            
        res.json(prendaActualizada);   
    } catch (error) {
        // Manejar errores específicos
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar la prenda', error: error.message });
    }
};
// Eliminar una prenda
const deletePrenda = async (req, res) => {
    try{
        const prenda = await Prenda.findByPk(req.params.id);
        if (!prenda){
            return res.status(404).json({ message: 'Prenda no encontrada' });
        }
        
        // Verificar si la prenda tiene stock asociado antes de eliminarla
        const { Stock } = require('../models');
        const stockAsociado = await Stock.findOne({ where: { prenda_id: prenda.id } });
        
        if (stockAsociado) {
            return res.status(400).json({ 
                message: 'No se puede eliminar la prenda porque tiene stock asociado. Elimine primero el stock.'
            });
        }
        
        await prenda.destroy();
        res.json({ message: 'Prenda eliminada correctamente' });
    } catch (error){
        res.status(500).json({message: 'Error al eliminar la prenda', error: error.message})
    }
}
module.exports ={
    getAllPrendas,
    getPrendaById,
    createPrenda,
    updatePrenda,
    deletePrenda
}