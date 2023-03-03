const Joi = require('joi');
const mongoose = require('mongoose')
const { Genre } = require('./genre')

const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: { type: String, minlength: 5, required: true, maxlength: 255, trim: true },
    genre: { type: Genre.schema, required: true },
    numberInStock: { type: Number, min: 0 },
    dailyRentalRate: { type: Number }
}));

function validateMovie(movie) {
    const validationSchemma = {
        title: Joi.string().min(5).max(200).required(),
        numberInStock: Joi.number().min(0).required(),
        dailyRentalRate: Joi.number().min(0).required(),
        genreId: Joi.ObjectId().required()
    }
    return Joi.validate(movie, validationSchemma);
}

module.exports = { validateMovie, Movie }