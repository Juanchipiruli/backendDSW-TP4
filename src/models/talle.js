const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Talle = sequelize.define('Talle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'talles'
});

module.exports = Talle;

