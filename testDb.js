const sequelize = require('./database');

sequelize.authenticate()
  .then(() => {
    console.log('Success!');
  })
  .catch(err => {
    console.error('Failed Conection:', err);
  });
