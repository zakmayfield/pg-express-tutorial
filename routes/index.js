const route = require('express').Router();

route.use('/users', require('../routes/users/userRoutes'));

route.use('/', (req, res) => {
  res.send('✅ /api');
});

module.exports = route;
