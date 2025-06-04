const { Carrito, CarritoStock, Stock, Prenda, User } = require('../models');
const sequelize = require('../config/database');

/**
 * Get cart by ID with all its items
 */
const getCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findByPk(req.params.id, {
            include: [{
                model: Stock,
                include: [{
                    model: Prenda,
                    attributes: ['nombre', 'precio', 'imagenes']
                }]
            }]
        });

        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.json(carrito);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener el carrito',
            error: error.message
        });
    }
};

/**
 * Get user's active cart or create a new one if none exists
 */
const getUserCart = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        
        // Check if user exists
        const user = await User.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Find active cart or create new one
        let carrito = await Carrito.findOne({
            where: { usuario_id },
            include: [{
                model: Stock,
                include: [{
                    model: Prenda,
                    attributes: ['nombre', 'precio', 'imagenes']
                }]
            }]
        });
        
        if (!carrito) {
            carrito = await Carrito.create({ usuario_id });
            // Fetch again with includes
            carrito = await Carrito.findByPk(carrito.id, {
                include: [{
                    model: Stock,
                    include: [{
                        model: Prenda,
                        attributes: ['nombre', 'precio', 'imagenes']
                    }]
                }]
            });
        }
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener/crear el carrito del usuario',
            error: error.message
        });
    }
};

/**
 * Create a new cart for a user
 */
const createCarrito = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        
        // Validate required field
        if (!usuario_id) {
            return res.status(400).json({ message: 'El ID de usuario es requerido' });
        }

        // Validate user exists
        const user = await User.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Create cart
        const carrito = await Carrito.create({ usuario_id });

        res.status(201).json({
            message: 'Carrito creado correctamente',
            carrito
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el carrito',
            error: error.message
        });
    }
};

/**
 * Add item to cart
 */
const addItemToCarrito = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { carrito_id, stock_id, cantidad } = req.body;

        // Validate input
        if (!carrito_id || !stock_id || !cantidad || cantidad < 1) {
            return res.status(400).json({
                message: 'Datos inválidos para agregar item al carrito'
            });
        }

        // Check if cart exists
        const carrito = await Carrito.findByPk(carrito_id);
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Check if stock exists and has enough quantity
        const stock = await Stock.findByPk(stock_id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock no encontrado' });
        }

        if (!stock.disponible) {
            return res.status(400).json({ message: 'Este producto no está disponible actualmente' });
        }

        if (stock.cantidad < cantidad) {
            return res.status(400).json({ 
                message: 'No hay suficiente stock disponible',
                stockDisponible: stock.cantidad 
            });
        }

        // Add or update cart item
        const [carritoStock, created] = await CarritoStock.findOrCreate({
            where: { CarritoId: carrito_id, StockId: stock_id },
            defaults: { cantidad },
            transaction: t
        });

        if (!created) {
            // Si ya existe, verificar que la cantidad total no exceda el stock disponible
            const nuevaCantidad = carritoStock.cantidad + cantidad;
            
            if (nuevaCantidad > stock.cantidad) {
                await t.rollback();
                return res.status(400).json({ 
                    message: 'La cantidad total excede el stock disponible',
                    stockDisponible: stock.cantidad,
                    enCarrito: carritoStock.cantidad
                });
            }
            
            await carritoStock.update({
                cantidad: nuevaCantidad
            }, { transaction: t });
        }

        // No reducimos el stock en este punto, solo al confirmar la compra
        await t.commit();

        res.json({
            message: 'Item agregado al carrito correctamente',
            carritoStock
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Error al agregar item al carrito',
            error: error.message
        });
    }
};

/**
 * Update cart item quantity
 */
const updateCarritoItem = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { carrito_id, stock_id, cantidad } = req.body;

        // Validate input
        if (!carrito_id || !stock_id || cantidad === undefined || cantidad < 0) {
            return res.status(400).json({
                message: 'Datos inválidos para actualizar item del carrito'
            });
        }

        // Find cart item
        const carritoStock = await CarritoStock.findOne({
            where: { CarritoId: carrito_id, StockId: stock_id }
        });

        if (!carritoStock) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        // If quantity is 0, remove the item
        if (cantidad === 0) {
            // Remove item from cart
            await carritoStock.destroy({ transaction: t });
            
            await t.commit();
            
            return res.json({ message: 'Item eliminado del carrito correctamente' });
        }

        // Get stock information
        const stock = await Stock.findByPk(stock_id);
        
        // Verificar que haya suficiente stock disponible
        if (cantidad > stock.cantidad) {
            await t.rollback();
            return res.status(400).json({ 
                message: 'No hay suficiente stock disponible',
                stockDisponible: stock.cantidad 
            });
        }

        // Update cart item
        await carritoStock.update({ cantidad }, { transaction: t });

        await t.commit();

        res.json({
            message: 'Item del carrito actualizado correctamente',
            carritoStock
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Error al actualizar item del carrito',
            error: error.message
        });
    }
};

/**
 * Remove item from cart
 */
const removeCarritoItem = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { carrito_id, stock_id } = req.params;

        // Find cart item
        const carritoStock = await CarritoStock.findOne({
            where: { CarritoId: carrito_id, StockId: stock_id }
        });

        if (!carritoStock) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        // Remove item from cart
        await carritoStock.destroy({ transaction: t });

        await t.commit();

        res.json({ message: 'Item eliminado del carrito correctamente' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Error al eliminar item del carrito',
            error: error.message
        });
    }
};

/**
 * Delete cart
 */
const deleteCarrito = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const carrito = await Carrito.findByPk(req.params.id);

        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Delete cart and all its items (CarritoStock records will be eliminados por cascada)
        await carrito.destroy({ transaction: t });

        await t.commit();

        res.json({ message: 'Carrito eliminado correctamente' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Error al eliminar el carrito',
            error: error.message
        });
    }
};

/**
 * Checkout cart - simulates purchase completion
 */
const checkoutCarrito = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { carrito_id } = req.params;
        
        // Find cart with all its items
        const carrito = await Carrito.findByPk(carrito_id, {
            include: [{ 
                model: Stock,
                include: [{ model: Prenda }]
            }]
        });
        
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        
        if (!carrito.Stocks || carrito.Stocks.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }
        
        // Verificar disponibilidad de stock para todos los items
        for (const stock of carrito.Stocks) {
            const cantidadSolicitada = stock.CarritoStock.cantidad;
            
            // Verificar que el producto sigue disponible
            if (!stock.disponible) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `El producto ${stock.Prenda.nombre} ya no está disponible`,
                    stockId: stock.id
                });
            }
            
            // Verificar que hay suficiente stock
            if (stock.cantidad < cantidadSolicitada) {
                await t.rollback();
                return res.status(400).json({ 
                    message: `Stock insuficiente para ${stock.Prenda.nombre}`,
                    stockId: stock.id,
                    stockDisponible: stock.cantidad,
                    cantidadSolicitada
                });
            }
            
            // Reducir el stock
            await stock.update({
                cantidad: stock.cantidad - cantidadSolicitada
            }, { transaction: t });
        }
        
        // Calculate total price
        let total = 0;
        const items = [];
        
        for (const stock of carrito.Stocks) {
            const itemTotal = stock.Prenda.precio * stock.CarritoStock.cantidad;
            total += itemTotal;
            
            items.push({
                prenda: stock.Prenda.nombre,
                cantidad: stock.CarritoStock.cantidad,
                precio_unitario: stock.Prenda.precio,
                subtotal: itemTotal
            });
        }
        
        // Here you would typically:
        // 1. Process payment
        // 2. Create order record
        
        // Empty the cart since the purchase is completed
        await CarritoStock.destroy({
            where: { CarritoId: carrito_id },
            transaction: t
        });
        
        await t.commit();
        
        res.json({
            message: 'Compra realizada exitosamente',
            purchase: {
                cart_id: carrito_id,
                items,
                total,
                date: new Date()
            }
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({
            message: 'Error al procesar la compra',
            error: error.message
        });
    }
};

module.exports = {
    getCarrito,
    getUserCart,
    createCarrito,
    addItemToCarrito,
    updateCarritoItem,
    removeCarritoItem,
    deleteCarrito,
    checkoutCarrito
};
