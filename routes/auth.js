const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');

const express = require('express');
const { User } = require('../models/user');

const route = express.Router();

route.post('/', async (req, res) => {
    try {
        const { error } = validateAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return 'Invalid email or password';
        
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) return 'Invalid email or password';

        const token = user.generateAuthToken();
        return res.send(token);
    } catch (error) {
        return  res.status(400).send(error.message);
    }
    
});

function validateAuth(req) {
    const schemaValidator = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(8).max(255).required()
    };

    return Joi.validate(req, schemaValidator);
}

module.exports = route;