
const mongoose = require('mongoose')
const config = require('config');
const logger = require('./logging');

module.exports = function (){
    mongoose.set('strictQuery', false);
    const dbconection= config.get('mongodbconnection');
    mongoose.connect(dbconection).then(() => {
        logger.info(`Connected to ${dbconection}....`)
    })
}