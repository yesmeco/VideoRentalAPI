const Joi = require('joi');
const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 5, maxlength: 50 },
    status: { type: Boolean, default: true }
})

genreSchema.methods.getGenre = function (id) {
    return this.findById(id);
}

const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(genre) {
    const validationScheme = {
        name: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(genre, validationScheme);
}

module.exports = { validateGenre, Genre };