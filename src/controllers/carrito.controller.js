const Carrito = require('../models');

const getCarrito = async (req, res) => {
    try{
        const carrito= await Carrito.findByPk(req.params.id);
        if (carrito){
            res.json(carrito)
        } else {
            res.status(404).json({message: 'Carrito no encontrado'})
        }
    } catch(error){
        res.status(500).json({message: error.nessage})
    }
}

const createCarrito = async(req, res) => {
    try{
        const {elementList}=req.body; 
        const carrito = await Carrito.create({elementList});
        res.status(201).json(prenda);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

const updateCarrito = async(req, res) => {
    try{
        const {elementList}=req.body;
        const carrito = await Carrito.findByPk();
        if (carrito){
            await prenda.update({elementList});
        } else {
            res.status(404).json({message: 'Carrito no encontrado'})
        }
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

const deleteCarrito = async (req, res) => {
    try{
        const carrito = await Carrito.findByPk(req.params.id)
        if (carrito){
            await carrito.destroy();
            res.json({message: 'Carrito eliminado'})
        }else{
            res.status(404).json({message: 'Carrito no encontrado'})
        }
    }catch(error){
        res.status(500).json({message: error.message})
    }
}
module.exports ={
    getCarrito,
    createCarrito,
    updateCarrito,
    deleteCarrito
}