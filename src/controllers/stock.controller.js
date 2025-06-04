const { Stock, Prenda, Color, Talle } = require('../models');

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

        if (!prenda || !talle || !color) {
            return res.status(404).json({
                message: 'No se encontró la prenda, talle o color especificado'
            });
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
            stock: newStock
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
        const { cantidad, disponible } = req.body;

        const stock = await Stock.findByPk(id);

        if (!stock) {
            return res.status(404).json({
                message: 'No se encontró el registro de stock'
            });
        }

        await stock.update({
            cantidad: cantidad !== undefined ? cantidad : stock.cantidad,
            disponible: disponible !== undefined ? disponible : stock.disponible
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

// Obtener stock por producto
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

module.exports = {
    createStock,
    updateStock,
    getStockByProduct,
    checkAvailability,
    updateAvailability,
    getAllStock
};

