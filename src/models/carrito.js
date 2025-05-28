const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Stock = require('./stock');

const Carrito = sequelize.define('Carrito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id'
    }
  }
}, {
  tableName: 'carritos'
});

// Tabla intermedia para la relación muchos a muchos entre Carrito y Stock
const CarritoStock = sequelize.define('CarritoStock', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'carrito_stock'
});

// Definir las relaciones
Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Carrito, { foreignKey: 'usuario_id' });

// Relación muchos a muchos entre Carrito y Stock
Carrito.belongsToMany(Stock, { through: CarritoStock });
Stock.belongsToMany(Carrito, { through: CarritoStock });

module.exports = { Carrito, CarritoStock };

