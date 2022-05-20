const express = require('express');
const bodyParser = require('body-parser');

const PORT = 6767;

const app = express();

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`nodemon listening on http://localhost:${PORT}`))

