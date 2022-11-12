const db = require('../db/dbConfig');

const getUsers = async (req, res) => {
  let users = await db('users');
  res.status(200).json(users);
};

const createUser = async (req, res) => {
  let payload = req.body;
  await db('users').insert(payload);
  res.status(200).json(payload);
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  let user = await db('users').where('id', id).first();

  if (user) {
    await db('users').where('id', id).update(payload);
    res.status(200).json(payload);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  let user = await db('users').where('id', id).first();
  await db('users').where('id', id).del();
  res.status(200).json(user);
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
