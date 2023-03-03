const express = require('express');
const Joi = require('joi');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const asyncMiddleware = require('../middleware/asyncRoutes')
const route = express.Router();



route.post('/', [auth, validate(validateReturn)], asyncMiddleware(async (req, res, next) => {

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('Rental not found');

    if (rental.dateReturned) return res.status(400).send('Return has been processed');

    rental.return();
    await rental.save();

    await Movie.updateOne({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });

    return res.send(rental);
}));

function validateReturn(request) {
    const validationScheme = {
        customerId: Joi.ObjectId().required(),
        movieId: Joi.ObjectId().required()
    };
    return Joi.validate(request, validationScheme);
}


module.exports = route;