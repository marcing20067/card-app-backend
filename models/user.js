const mongoose = require('mongoose');;
const { Schema } = mongoose;
const errorTexts = require('../errorTexts/errorTexts');
const invalidDataErrorText = errorTexts.invalidData;

const User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: value => /[a-z]/i.test(value),
            message: props => {
                return invalidDataErrorText
            }
        },
        minLength: 4
    },
    isActivated: { type: Boolean, required: true},
    email: {
        type: String,
        validate: {
            validator: value => /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(value),
            message: props => {
                return invalidDataErrorText
            }
        },
        minLength: 4
    },
    password: { type: String, required: true, minLength: 8 }
}, { versionKey: false })

module.exports = mongoose.model('User', User);
