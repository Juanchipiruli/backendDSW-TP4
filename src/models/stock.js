const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Prenda = require('./prenda');
const Talle = require('./talle');
const Color = require('./color');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  prenda_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Prenda,
      key: 'id'
    }
  },
  talle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Talle,
      key: 'id'
    }
  },
  color_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Color,
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stocks'
});

// Definir las relaciones
Stock.belongsTo(Prenda, { foreignKey: 'prenda_id' });
Stock.belongsTo(Talle, { foreignKey: 'talle_id' });
Stock.belongsTo(Color, { foreignKey: 'color_id' });

Prenda.hasMany(Stock, { foreignKey: 'prenda_id' });
Talle.hasMany(Stock, { foreignKey: 'talle_id' });
Color.hasMany(Stock, { foreignKey: 'color_id' });

module.exports = Stock;

