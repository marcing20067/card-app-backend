const mongoose = require('mongoose');;
const { Schema } = mongoose;
const userErrorsMessages = require('../errorTexts/modelsTexts/user.js')

const User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: value => /[a-z]/i.test(value),
            message: props => {
                return userErrorsMessages.invalidData
            }
        },
        minLength: 4
    },
    password: { type: String, required: true, minLength: 8 }
}, { versionKey: false })

module.exports = mongoose.model('User', User);
