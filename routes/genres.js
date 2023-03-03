const express = require('express');
const { Genre, validateGenre } = require('../models/genre');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleware = require('../middleware/asyncRoutes');

const route = express.Router();

//GET
route.get('/', asyncMiddleware(async (req, res, next) => {
    return res.status(200).send(await Genre.find().sort('name'));
}));

//GET:id
route.get('/:id', validateObjectId, asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);

    if (!genre) return res.status(404).send('The given ID was not found');

    res.status(200).send(genre);
}));

//POST
route.post('/', [auth, validate(validateGenre)], asyncMiddleware(async (req, res) => {
    const genre = new Genre({
        name: req.body.name,
        status: req.body.status
    });
    res.status(200).send(await genre.save());
}));

//PUT
route.put('/:id', [auth, validateObjectId, validate(validateGenre)], asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send('The given ID was not found');

    genre.name = req.body.name;
    genre.status = req.body.status;
    genre = await genre.save()

    res.status(200).send(genre);
}));

//DELETE
route.delete('/:id', [auth, admin, validateObjectId], asyncMiddleware(async (req, res) => {
    const genre = await Genre.deleteOne({ _id: req.params.id });
    if (!genre) return res.status(404).send('The given ID was not found');
    res.status(200).send(genre);
}));


module.exports = route;