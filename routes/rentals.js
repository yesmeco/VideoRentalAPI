const express = require('express');
const { validateRental, Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/asyncRoutes');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const route = express.Router();

route.get('/', auth, asyncMiddleware(async (req, res) => {
    res.status(200).send(await Rental.find());
}));

route.get('/:id', auth, asyncMiddleware(async (req, res) => {
    const rental = await Rental.find({ _id: req.params.id }).sort('-dateOut');
    if (!rental) return res.status(400).send('The provided id was no found');

    res.status(200).send(rental);
}));

route.post('/', [auth, validate(validateRental)], asyncMiddleware(async (req, res) => {

    const movie = await Movie.findOne({ _id: req.body.movieId });
    if (!movie) return 'Invalid movie';


    const customer = await Customer.findOne({ _id: req.body.customerId });
    if (!customer) return 'Invalid customer';

    if (movie.numberInStock === 0) return 'Movie not in stock';

    const rental = new Rental({
        customer: {
            _id: customer._id,
            isGold: customer.isGold,
            name: customer.name,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        },
    });

    //Two Phase Commit Aproach by MongoDBSite
    const result = await commitNewRetal(rental);

    if (result.rental) res.send(rental);
    else return res.send(result);
}));

route.delete('/:id', [auth, validateObjectId, admin], asyncMiddleware(async (req, res) => {
    return res.send(await Rental.deleteOne({ _id: req.params.id }));
}));

async function commitNewRetal(rental) {
    const result = { isMovieStockUpdated: false, message: '' };
    try {
        const commitedRental = await new Rental(rental).save();

        const validateRentalCommit = await getRental(commitedRental._id);
        if (validateRentalCommit) {
            await Movie.updateOne({ _id: rental.movie._id }, { $inc: { numberInStock: -1 } });
            const validateMovieUpdate = await Movie.find(rental.movie._id);
            if (validateMovieUpdate) {
                result.isMovieStockUpdated = true;
                result.rental = commitedRental;
            } else {
                await deleteRental(commitedRental._id);
                result.message = 'Changes were not comitted'
            }
        } else {
            result.message = 'Changes were not comitted'
        }
    } catch (error) {
        result.message = error.message;
    }
    return result;
}

module.exports = route;
