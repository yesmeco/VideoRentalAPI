const express = require('express');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');
const asyncMiddleware = require('../middleware/asyncRoutes');
const validate = require('../middleware/validate');
const { validateCustomer, Customer } = require('../models/customer');

const route = express.Router()

route.get('/', auth, asyncMiddleware(async (req, res) => {
    res.status(200).send(await Customer.find());
}));

route.get('/:id', [auth, validateObjectId], asyncMiddleware(async (req, res) => {
    res.status(200).send(await Customer.findById(req.params.id));
}));

route.post('', [auth, validate(validateCustomer)], asyncMiddleware(async (req, res) => {
    const customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
    });
    await customer.save();

    res.status(200).send(customer);
}));

route.put('/:id', [auth, validateObjectId, validate(validateCustomer)], asyncMiddleware(async (req, res) => {
    const customer = await Customer.findOneAndUpdate(id, {
        $set: {
            name: req.body.name,
            isGold: req.body.isGold,
            phone: req.body.phone
        }
    }, { new: true });

    res.status(200).send(customer);
}));

route.delete('/:id', [auth, validateObjectId, admin], asyncMiddleware(async (req, res) => {
    res.status(200).send(await Customer.deleteOne({ _id: req.params.id }));
}));


module.exports = route;