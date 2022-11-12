/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('users').insert([
    {
      username: 'john',
      email: 'john@email.com',
    },
    {
      username: 'raj',
      email: 'raj@email.com',
    },
    {
      username: 'sarah',
      email: 'sarah@email.com',
    },
  ]);
};
