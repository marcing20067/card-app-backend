const mongoose = require('mongoose');;
const { Schema } = mongoose;
const errorTexts = require('../errorTexts/errorTexts');
const invalidUsernameErrorText = errorTexts.models.user.invalidUsername;

const User = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: value => /[a-z]/i.test(value),
            message: props => {
                return invalidUsernameErrorText
            }
        },
        minLength: 4
    },
    password: { type: String, required: true, minLength: 8 }
}, { versionKey: false })

module.exports = mongoose.model('User', User);
