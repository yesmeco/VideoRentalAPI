const express = require('express');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre')
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const asyncMiddleware = require('../middleware/asyncRoutes');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

const route = express.Router();

route.get('/', auth, asyncMiddleware(async (req, res) => {
    return res.status(200).send(await Movie.find());
}));

route.get('/:id', [auth, validateObjectId],asyncMiddleware( async (req, res) => {
    if (req.params.id)
        return res.status(200).send(await Movie.findById(req.params.id));
}))

route.post('/', [auth, validate(validateMovie)], asyncMiddleware(async (req, res) => {
    const genre = new Genre().getGenre(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre id');

    const movie = new Movie({
        title: req.body.title,
        genre: { _id: genre._id, name: genre.name },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    await movie.save();

    return res.status(200).send(movie);
}))

route.put('/:id', [auth, validateObjectId, validate(validateMovie)], asyncMiddleware(async (req, res) => {

    const genre = new Genre().getGenre(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid genre id');

    const movie = await Movie.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            title: req.body.title,
            genre: { _id: genre._id, name: genre.name },
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }
    }, { new: true });

    return res.status(200).send(movie);
}))

route.delete('/:id', [auth, admin, validateObjectId], asyncMiddleware(async (req, res) => {
    return res.status(200).send(await Movie.deleteOne({ _id: req.params.id }));
}))


module.exports = route;