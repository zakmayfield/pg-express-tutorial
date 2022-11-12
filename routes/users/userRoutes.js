const route = require('express').Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../../controllers/userController');

route.get('/', getUsers);
route.post('/', createUser);
route.put('/:id', updateUser);
route.delete('/:id', deleteUser);

module.exports = route;
