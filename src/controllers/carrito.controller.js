const { Carrito, CarritoStock, Stock, Prenda, User, Talle, Color } = require('../models');
const sequelize = require('../config/database');

// Funcion que devuelve el carrito con sus items y el detalle de cada item con la prenda completa
const getCarrito = async (req, res) => {
    try {
        const carrito = await Carrito.findByPk(req.params.id, { // Obtenemos el carrito con su id
            include: [{ // Indicamos que informacion del carrito queremos devolver
                model: Stock,
                include: [{
                    model: Prenda,
                    attributes: ['nombre', 'precio', 'imagenes']
                }]
            }]
        });

        if (!carrito) { // Validacion por si no se encuentra el carrito
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.json(carrito); // Devolvemos el carrito
    } catch (error) {
        res.status(500).json({ // Devolvemos un error si algo sale mal
            message: 'Error al obtener el carrito',
            error: error.message
        });
    }
};

// Funcion que devuelve el carrito activo de un usuario y si no tiene uno lo crea
const getUserCart = async (req, res) => {
    try {
        const { usuario_id } = req.params; // Obtenemos el id del usuario de la request
        
        // Obtenemos el usuario a traves de su id
        const user = await User.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' }); // Devolvemos error si no se encuentra el usuario
        }
        
        // Obtenemos el carrito activo con el id del usuario
        let carrito = await Carrito.findOne({
            where: { usuario_id },
            include: [{
                model: Stock,
                include: [{
                    model: Prenda,
                    attributes: ['nombre', 'precio', 'imagenes']
                }, {
                    model: Talle,
                    attributes: ['nombre']
                }, {
                    model: Color,
                    attributes: ['nombre']
                }]
            }]
        });
        
        if (!carrito) { // Si no encontramos un carrito activo creamos uno y lo obtenemos
            carrito = await Carrito.create({ usuario_id });

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
        
        res.json(carrito); // Devolvemos el carrito
    } catch (error) {
        res.status(500).json({ // Devolvemos un error si algo sale mal
            message: 'Error al obtener/crear el carrito del usuario',
            error: error.message
        });
    }
};

// Funcion para crear un carrito para un usuario ****CHEQUEAR****
const createCarrito = async (req, res) => {
    try {
        const { usuario_id } = req.body; // Obtenemos el id del usuario de la request
        
        // Validacion por si no se envía el id del usuario
        if (!usuario_id) {
            return res.status(400).json({ message: 'El ID de usuario es requerido' });
        }

        // Validamos que el usuario exista
        const user = await User.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Creamos el carrito vinculado al usuario
        const carrito = await Carrito.create({ usuario_id });

        res.status(201).json({ // Devolvemos mensaje con el carrito creado
            message: 'Carrito creado correctamente',
            carrito
        });
    } catch (error) {
        res.status(500).json({ // Devolvemos error si algo sale mal
            message: 'Error al crear el carrito',
            error: error.message
        });
    }
};

// Funcion para agregar un item al carrito
const addItemToCarrito = async (req, res) => {
    const t = await sequelize.transaction(); // Creamos una nueva transaccion en la base de datos y almacenamos la referencia a esta
    try {
        const { carrito_id, stock_id, cantidad, prenda_id, color_id, talle_id } = req.body; // Obtenemos el id del carrito, el id del stock y la cantidad de items

        // Validamos los datos que se estan enviando y que cantidad no sea menor a 1
        if (!carrito_id || !stock_id || !cantidad || cantidad < 1 || !prenda_id || !color_id || !talle_id) {
            return res.status(400).json({
                message: 'Datos inválidos para agregar item al carrito'
            });
        }

        // Verificamos si existe un carrito para el usuario
        const carrito = await Carrito.findByPk(carrito_id);
        if (!carrito) { // Devolvemos error si el usuario no tiene un carrito asociado
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Verificamos si existe un stock con el id recibido
        const stock = await Stock.findByPk(stock_id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock no encontrado' });
        }

        const prenda = await Prenda.findByPk(prenda_id);
        if (!prenda) {
            return res.status(404).json({ message: 'Prenda no encontrada' });
        }

        const color = await Color.findByPk(color_id);
        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }

        const talle = await Talle.findByPk(talle_id);
        if (!talle) {
            return res.status(404).json({ message: 'Talle no encontrado' });
        }

        // Verificamos si este stock esta disponible
        if (!stock.disponible) {
            return res.status(400).json({ message: 'Este producto no está disponible actualmente' });
        }

        // Verificamos si este stock tiene la cantidad solicitada
        if (stock.cantidad < cantidad) {
            return res.status(400).json({ 
                message: 'No hay suficiente stock disponible',
                stockDisponible: stock.cantidad 
            });
        }

        // Creamos o actualizamos el carrito
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
            
            await carritoStock.update({ // Actualizamos la cantidad del item en el carrito
                cantidad: nuevaCantidad
            }, { transaction: t });
        }

        // No reducimos el stock en este punto, solo al confirmar la compra
        await t.commit();

        res.json({
            message: 'Item agregado al carrito correctamente',
            carritoStock: {...stock.dataValues, CarritoStock: carritoStock, Prenda: prenda, Color: color, Talle: talle}
        });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ // Devolvemos error si algo sale mal 
            message: 'Error al agregar item al carrito',
            error: error.message
        });
    }
};

// Actualizamos la cantidad de un item en el carrito
const updateCarritoItem = async (req, res) => {
    const t = await sequelize.transaction(); // Creamos una nueva transaccion en la base de datos y almacenamos la referencia a esta

    try {
        const { carrito_id, stock_id, cantidad } = req.body; // Obtenemos el id del carrito, del stock y la cantidad del item

        // Validamos los datos de entrada
        if (!carrito_id || !stock_id || cantidad === undefined || cantidad < 0) {
            return res.status(400).json({
                message: 'Datos inválidos para actualizar item del carrito'
            });
        }

        // Buscamos el item del carrito a modificar
        const carritoStock = await CarritoStock.findOne({
            where: { CarritoId: carrito_id, StockId: stock_id }
        });

        // Si no obtenemos un item devolvemos un error
        if (!carritoStock) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        // Si la cantidad es 0 removemos el item del carrito
        if (cantidad === 0) {
            await carritoStock.destroy({ transaction: t });
            
            await t.commit();
            
            return res.json({ message: 'Item eliminado del carrito correctamente' });
        }

        // Obtenemos el stock del item a modificar
        const stock = await Stock.findByPk(stock_id);
        
        // Verificar que haya suficiente stock disponible
        if (cantidad > stock.cantidad) {
            await t.rollback();
            return res.status(400).json({ 
                message: 'No hay suficiente stock disponible',
                stockDisponible: stock.cantidad 
            });
        }

        // Actualizamos la cantidad del item en el carrito
        await carritoStock.update({ cantidad }, { transaction: t });

        await t.commit();

        res.json({
            message: 'Item del carrito actualizado correctamente',
            carritoStock
        });
    } catch (error) { // Devolvemos error si algo sale mal
        await t.rollback();
        res.status(500).json({
            message: 'Error al actualizar item del carrito',
            error: error.message
        });
    }
};

// Removemos un item del carrito
const removeCarritoItem = async (req, res) => {
    const t = await sequelize.transaction(); // Creamos una nueva transaccion en la base de datos y almacenamos la referencia a esta

    try {
        const { carrito_id, stock_id } = req.params; // Obtenemos el id del carrito y el del stock

        // Obtenemos el item a remover del carrito
        const carritoStock = await CarritoStock.findOne({
            where: { CarritoId: carrito_id, StockId: stock_id }
        });

        // Si no encontramos el item devolvemos un error
        if (!carritoStock) {
            return res.status(404).json({ message: 'Item no encontrado en el carrito' });
        }

        // Removemos el item del carrito
        await carritoStock.destroy({ transaction: t });

        await t.commit();

        res.json({ message: 'Item eliminado del carrito correctamente', carritoStock });
    } catch (error) { // Devolvemos error si algo sale mal
        await t.rollback();
        res.status(500).json({
            message: 'Error al eliminar item del carrito',
            error: error.message
        });
    }
};

// Funcion para eliminar el carrito
const deleteCarrito = async (req, res) => {
    const t = await sequelize.transaction(); // Creamos una nueva transaccion en la base de datos y almacenamos la referencia a esta

    try {
        const carrito = await Carrito.findByPk(req.params.id); // Obtenemos el carrito por su id

        // Si no se encuentra el carrito devolvemos un error
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Eliminamos el carrito
        await carrito.destroy({ transaction: t });

        await t.commit();

        res.json({ message: 'Carrito eliminado correctamente' });
    } catch (error) { // Devolvemos error si algo sale mal
        await t.rollback();
        res.status(500).json({
            message: 'Error al eliminar el carrito',
            error: error.message
        });
    }
};

// ****CHEQUEAR****
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
