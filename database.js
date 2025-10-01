const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('task8', 'ghossoun', '2001', {
  host: 'localhost',    
  dialect: 'postgres',
  logging: false        
});

module.exports = sequelize;
