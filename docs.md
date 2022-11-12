# How to: `Express` server with a `PostgreSQL` database

# PostgreSQL db

- Create a new db in your postgres server
- Gather the info to create a database_url string for the connection (`port`, `username`, `password`, `host`, `db name` ect)

&nbsp;

# Init

- Initialize app: `npm init`
- Initialize as a repository: `git init`
- Connect to repository, unless using the heroku cli

&nbsp;

# Dependencies

- `npm i`

  - `express`
  - `pg`
  - `knex`
  - `dotenv`
  - `body-parser`

- `npm i -D`
  - `nodemon`

&nbsp;

# Scripts (package.json)

```json
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
```

&nbsp;

# `.gitignore` & `.env`

- Create `.gitignore` on the root

```env
node_modules
.env
```

- Create `.env` on the root
  - Ensure that `DATABASE_URL` has the information from the DB that you created in postgres

```env
PORT=4000

DB_ENV=development

DATABASE_URL=postgres://{{username}}:{{password}}@{{host}}:{{port}}/{{db-name}}
```

&nbsp;

# Server

- Create `./server.js`

```js
const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`✅ Server OK`);
});

app.get('*', (req, res) => {
  res.send(`🚫 Route does not exist`);
});

app.listen(port, () => console.log(`✅ Server OK`));
```

- Run command: `npm run dev`
  - Visit `localhost:4000` to view running server

&nbsp;

# Configure db

- Run command: `knex init`
  - If this command throws an error just create `./knexfile.js`

```js
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    },
    useNullAsDefault: true,
  },
};
```

- Create `./db/dbConfig.js`

```js
require('dotenv').config();
const config = require('../knexfile');
const knex = require('knex');

const environment = process.env.DB_ENV || 'development';

module.exports = knex(config[environment]);
```

- `dbConfig.js` is now a direct connection between our server and db

&nbsp;

# Knex `Migrations` and `Seeds`

- Run command: `knex migrate:make create-users-table`

- Open `./db/migrations/{{file}}`

```js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (user) => {
    user.increments();

    user.string('username').notNullable().unique();
    user.string('email').notNullable().unique();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
```

- Skip next step if you don't want to seed your db

- Run command: `knex seed:make users-data`

- Open `./db/seeds/{{file}}`

```js
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
```

&nbsp;

# Running migrations

- Run command: `knex migrate:latest` to run the migration files
- Run command: `knex seed:run` to run the seed files

&nbsp;

## To view the database and users

- open `pgAdmin` or use `psql` to run a query on the db you've created with `SELECT * FROM users`
  - If you haven't received any erros up to this point the data returned from this query should be our seeded user data

&nbsp;

# Routes

- Create `./routes/index.js`

```js
const route = require('express').Router();

route.use('/', (req, res) => {
  res.send('✅ /api');
});

module.exports = route;
```

- In `./server.js` add an `/api` context route under the rest of the middleware

```js
app.use('/api', require('./routes'));
```

- `/api` is now a functioning endpoint

&nbsp;

# Users route

- Create `./routes/users/userRoutes.js`

```js
const route = require('express').Router();

route.get('/', (req, res) => {
  res.send(`✅ /users`);
});

module.exports = route;
```

- Use this users route within `./routes/index.js` above the base /api route

```js
route.use('/users', require('../routes/users/userRoutes'));
```

- `/users` is now a context route of `/api`
  - This means you can only access the users endpoint via `/api/users`

&nbsp;

# User Controller

- Create `./controllers/userController`

```js
const db = require('../db/dbConfig');

const getUsers = async (req, res) => {
  let users = await db('users');

  // error handling
  res.status(200).json(users);
};

module.exports = {
  getUsers,
};
```

- _Note: for the sake of a concise tutorial we aren't handling errors_

- Import and use `getUsers` within `userRoutes.js`

```js
const { getUsers } = require('../../controllers/userController');

// change the GET route to use the controller
route.get('/', getUsers);
```

- `/api/users` now serves the array of users

&nbsp;

# Implementing the rest of the CRUD

## Create a user

- `userController.js`

```js
const createUser = async (req, res) => {
  let payload = req.body;
  await db('users').insert(payload);

  // error handling
  res.status(200).json(payload);
};

module.exports = {
  getUsers,
  createUser,
};
```

- Update `/routes/users/userRoutes.js` to use `createUser`
  - Beneath the `getUsers` endpiont

```js
route.post('/', createUser);
```

- Test this endpoint using `postman` or your choice of api platform, verify you can add a user

&nbsp;

## Update a user

- `userController.js`

```js
const updateUser = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  let user = await db('users').where('id', id).first();

  if (user) {
    await db('users').where('id', id).update(payload);
    res.status(200).json();
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
};
```

- Update `/routes/users/userRoutes.js` to use `updateUser`
  - Beneath the `createUser` endpiont

```js
route.put('/:id', updateUser);
```

&nbsp;

## Delete a user

- `userController.js`

```js
const deleteUser = async (req, res) => {
  const { id } = req.params;
  let user = await db('users').where('id', id).first();

  // error handling
  await db('users').where('id', id).del();
  res.status(200).json(user);
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
```

- Update `/routes/users/userRoutes.js` to use `deleteUser`
  - Beneath the `updateUser` endpiont

```js
route.delete('/:id', deleteUser);
```

&nbsp;

# Deploy on `heroku`

1. Create new app on `heroku`
   1. Connect `GitHub` repository
   2. Enable automatic deploys
   3. Deploy branch & let the build finish

&nbsp;

2. Click on `Resources` and add `Heroku Postgres`

&nbsp;

3. Go to `Settings` and `Reveal Config Vars`
   1. DATABASE_URL has been prepopulated with the production postgres db connection string
   2. Add `DB_ENV=production` as a config var
   3. Optional: I need to add a `PGSSLMODE=no-verify` env var for the ssl cert

&nbsp;

4. Click on `More` and `Run Console`

&nbsp;

5. Run command: `knex migrate:latest`
   1. If command `knex` cant be found then be sure to push your changes to github, the app probably doesn't have `knex` in the package.json
   2. If another error throws i would recommend using the `PGSSLMODE=no-verify` env var to by pass

&nbsp;

6. Run command: `knex seed:run`

&nbsp;

7. Open heroku app and hit the endpoints by appending `/api/users` to the url

&nbsp;

8. Confirm all endpoints are working as intended via `postman`
   1. When using the heroku api `{{appname}}.herokuapp.com` you are hitting the production database
