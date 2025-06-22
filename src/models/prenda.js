const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Marca = require('./marca');
const types = require('../defined/types.json');

const Prenda = sequelize.define('Prenda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
  },
  marca_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Marca,
      key: 'id'
    }
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imagenes: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'prendas'
});

// Definir la relación con Marca
Prenda.belongsTo(Marca, { foreignKey: 'marca_id' });
Marca.hasMany(Prenda, { foreignKey: 'marca_id' });

module.exports = Prenda;

