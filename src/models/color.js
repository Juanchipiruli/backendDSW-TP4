const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  codigo_hex: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'colores'
});

module.exports = Color;

