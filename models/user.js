const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 5, maxlength: 50 },
    email: {
        type: String,
        unique: true,
        required: true,
        maxlength: 255,
        minlength: 5,
        match: /^[a-zA-Z0-9..!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gm
    },
    password: { type: String, required: true, minlength: 8, maxlength: 255 },
    isAdmin: { type: Boolean, default: false },
    roles: [],
    operations:[]
});
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
};
const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schemaValidator = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    };

    return Joi.validate(user, schemaValidator);
}

module.exports = { validateUser, User };