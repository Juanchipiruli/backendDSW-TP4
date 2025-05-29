const {User} = require('../models')

const getUsersbyId = async (req, res) => {
    try{
        const user = await User.findbyPK(req.params.id)
        if (user){
            res.json(user)
        } else{
            res.status(404).json({message: 'Usuario no encontrado'})
        }
    } catch (error){
        res.status(500).json({message: error.message})
    }
}

const createUser = async (req, res) => {
    try{
        const {nombre, email, password, telefono, isAdmin=false, isAuthenticated=true} = req.body
        console.log("hola");
        const newUser = await User.create({nombre, email, password, telefono, isAdmin:false, isAuthenticated:true})
        res.status(201).json({message: 'Usuario creado correctamente'})
    }catch (error){
        res.status(500).json({message: error.message})
    }
}
const updateUser = async (req,res) => {
    try{
        const {nombre, email, password, telefono, isAdmin, isAuthenticated} = req.body
        const user = await User.findbyPK(req.params.id)
        if(user){
            await user.update({nombre, email, password, telefono, isAdmin, isAuthenticated})
        }else{
            res.status(404).json({message: 'Usuario no encontrado'})
        }
    } catch (error){
        res.status(500).json({message: error.message})
    }
}
const deleteUser = async (req, res) => {
    try{
        const user = await User.findbyPK(req.params.id)
        if (user){
            await user.destroy()
            res.json({message: 'Usuario eliminado'})
        }else{
            res.status(404).json({message: 'Usuario no encontrado'})
        }
    }catch (error){
        res.status(500).json({message: error.message})
    }
}
module.exports = {
    getUsersbyId,
    createUser,
    updateUser,
    deleteUser
}