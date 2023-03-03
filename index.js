const winston = require('winston');
const express = require('express');
const app = express();
const logger = require('./startup/logging');

require('./startup/routes')(app);
require('./startup/db')();
require('')
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { logger.info(`Listening on http://localhost:${PORT}`) });

module.exports = server;