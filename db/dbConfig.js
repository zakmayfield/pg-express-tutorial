require('dotenv').config();
const config = require('../knexfile');
const knex = require('knex');

const environment = process.env.DB_ENV || 'development';

module.exports = knex(config[environment]);
