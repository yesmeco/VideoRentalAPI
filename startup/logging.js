const winston = require('winston');
const config = require('config');
require('winston-mongodb');
require('express-async-errors');

const logger = winston.createLogger({
    transports: [
        //new winston.transports.MongoDB(
        //    {
        //        db: config.get('mongodbconnection'),
        //        options: { useUnifiedTopology: true },
        //        level: 'warn'
        //    }),
        new winston.transports.File({
            filename: config.get('logFileName'),
            level: 'info'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: config.get('exceptionlogFileName'), level: 'warn' }),
        new winston.transports.Console({ colorize: true, prettyPrint: true })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: config.get('rejectionlogFileName'), level: 'warn' })
    ],
    level: 'error'
});

module.exports = logger;
