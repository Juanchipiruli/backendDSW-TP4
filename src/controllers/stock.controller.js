const { Stock, Prenda, Color, Talle } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo registro de stock
const createStock = async (req, res) => {
    try {
        const { prenda_id, talle_id, color_id, cantidad, disponible } = req.body;

        // Verificar que existan los elementos relacionados
        const [prenda, talle, color] = await Promise.all([
            Prenda.findByPk(prenda_id),
            Talle.findByPk(talle_id),
            Color.findByPk(color_id)
        ]);

        if (!prenda) {
            return res.status(404).json({
                message: 'No se encontró la prenda'
            });
        }
        if(!talle){
            return res.status(404).json({
                message: "No se encontro el talle"
            })
        }
        if(!color){
            return res.status(404).json({
                message: "No se encontro el color"
            })
        }

        // Verificar si ya existe un stock para esta combinación
        const existingStock = await Stock.findOne({
            where: { prenda_id, talle_id, color_id }
        });

        if (existingStock) {
            return res.status(400).json({
                message: 'Ya existe un registro de stock para esta combinación de prenda, talle y color'
            });
        }

        const newStock = await Stock.create({
            prenda_id,
            talle_id,
            color_id,
            cantidad,
            disponible: disponible !== undefined ? disponible : true
        });

        res.status(201).json({
            message: 'Stock creado exitosamente',
            stock: {...newStock.dataValues, Color: color, Talle: talle, Prenda: prenda}
        });
    } catch (error) {
        console.error('Error al crear stock:', error);
        res.status(500).json({
            message: 'Error al crear el stock',
            error: error.message
        });
    }
};

// Actualizar un registro de stock existente
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, disponible, prenda_id, talle_id, color_id } = req.body;

        const stock = await Stock.findByPk(id);

        if (!stock) {
            return res.status(404).json({
                message: 'No se encontró el registro de stock'
            });
        }
        // Solo verificar duplicados si se están cambiando las claves de referencia
        if (prenda_id !== undefined || talle_id !== undefined || color_id !== undefined) {
            // Usar los valores nuevos o los actuales si no se proporcionan nuevos
            const newPrendaId = prenda_id !== undefined ? prenda_id : stock.prenda_id;
            const newTalleId = talle_id !== undefined ? talle_id : stock.talle_id;
            const newColorId = color_id !== undefined ? color_id : stock.color_id;
            
            // Buscar si ya existe otro registro con esta combinación (excluyendo el actual)
            const existingStock = await Stock.findOne({
                where: { 
                    prenda_id: newPrendaId, 
                    talle_id: newTalleId, 
                    color_id: newColorId,
                    id: { [Op.ne]: id } // Excluir el registro actual
                }
            });
            if (existingStock) {
                return res.status(400).json({
                    message: 'Ya existe un registro de stock para esta combinación de prenda, talle y color'
                });
            }
        }

        await stock.update({
            cantidad: cantidad !== undefined ? cantidad : stock.cantidad,
            disponible: disponible !== undefined ? disponible : stock.disponible,
            prenda_id: prenda_id!== undefined? prenda_id : stock.prenda_id,
            talle_id: talle_id!== undefined? talle_id : stock.talle_id,
            color_id: color_id!== undefined? color_id : stock.color_id
        });

        res.json({
            message: 'Stock actualizado exitosamente',
            stock
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({
            message: 'Error al actualizar el stock',
            error: error.message
        });
    }
};

// Se obtienen todos los stocks con el id de una prenda
const getStockByProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const stockItems = await Stock.findAll({
            where: { prenda_id: id },
            include: [
                { model: Prenda },
                { model: Talle },
                { model: Color }
            ]
        });
        res.json(stockItems);
    } catch (error) {
        console.error('Error al obtener stock:', error);
        res.status(500).json({
            message: 'Error al obtener el stock',
            error: error.message
        });
    }
};

// Verificar disponibilidad de stock
const checkAvailability = async (req, res) => {
    try {
        const { prenda_id, talle_id, color_id, cantidad } = req.body;

        const stock = await Stock.findOne({
            where: {
                prenda_id,
                talle_id,
                color_id,
                disponible: true
            }
        });

        if (!stock) {
            return res.status(404).json({
                message: 'No se encontró stock disponible para esta combinación',
                available: false
            });
        }

        const isAvailable = stock.cantidad >= cantidad;

        res.json({
            available: isAvailable,
            currentStock: stock.cantidad,
            message: isAvailable 
                ? 'Stock disponible' 
                : 'Stock insuficiente'
        });
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({
            message: 'Error al verificar disponibilidad',
            error: error.message
        });
    }
};

// Actualizar disponibilidad de stock
const updateAvailability = async (req, res) => {
    
    try {
        const { id } = req.params;
        const { disponible } = req.body;

        const stock = await Stock.findByPk(id);

        if (!stock) {
            return res.status(404).json({
                message: 'No se encontró el registro de stock'
            });
        }

        await stock.update({ disponible });

        res.json({
            message: 'Disponibilidad actualizada exitosamente',
            stock
        });
    } catch (error) {
        console.error('Error al actualizar disponibilidad:', error);
        res.status(500).json({
            message: 'Error al actualizar disponibilidad',
            error: error.message
        });
    }
};

// Obtener todo el stock
const getAllStock = async (req, res) => {
    try {
        const stockItems = await Stock.findAll({
            include: [
                { model: Prenda },
                { model: Talle },
                { model: Color }
            ]
        });

        res.json(stockItems);
    } catch (error) {
        console.error('Error al obtener stock:', error);
        res.status(500).json({
            message: 'Error al obtener el stock',
            error: error.message
        });
    }
};

const deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByPk(req.params.id);
        if(!stock){
            return res.status(404).json({
                message: 'No se encontró el registro de stock'
            });
        }
        await stock.destroy();
        res.json({ message: 'Stock eliminado exitosamente', stock });
    } catch (error) {
        console.error('Error al eliminar stock:', error);
        res.status(500).json({
            message: 'Error al eliminar el stock',
            error: error.message
        });
    }
};

module.exports = {
    createStock,
    updateStock,
    getStockByProduct,
    checkAvailability,
    updateAvailability,
    getAllStock,
    deleteStock
};

