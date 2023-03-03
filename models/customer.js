const Joi = require('joi')
const mongoose = require('mongoose')

const Customer = mongoose.model('Customer', new mongoose.Schema({
    isGold: { type: Boolean, default: false },
    name: { type: String, required: true, minlength: 5, maxlength: 50 },
    phone: { type: String, required: true, minlength: 5, maxlength: 50 }
}));

function validateCustomer(customer) {
    try {
        const validationSchema = {
            name: Joi.string().min(5).max(50).required(),
            phone: Joi.string().min(5).max(50).required()
        };

        return Joi.validate(customer, validationSchema);
    } catch (error) {
        return error;
    }
}

module.exports = { validateCustomer, Customer };