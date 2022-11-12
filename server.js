const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4000

app.use(bodyParser.json());
app.use('/api', require('./routes'))

app.get('/', (req, res) => {
  res.send(`✅ Server OK`);
});

app.get('*', (req, res) => {
  res.send(`🚫 Route does not exist`);
});

app.listen(port, () => console.log(`✅ Server OK`));