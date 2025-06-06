const Marca = require('./marca');
const Talle = require('./talle');
const Color = require('./color');
const User = require('./usuario');
const Prenda = require('./prenda');
const Stock = require('./stock');
const { Carrito, CarritoStock } = require('./carrito');

// Las relaciones ya están definidas en cada modelo, pero aquí las tenemos todas juntas como referencia

module.exports = {
  Marca,
  Talle,
  Color,
  User,
  Prenda,
  Stock,
  Carrito,
  CarritoStock
};

