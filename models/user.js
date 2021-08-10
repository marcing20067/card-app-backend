const mongoose = require('mongoose');;
const { Schema } = mongoose;


const User = new Schema({
    username: {
        type: String,
        required: true,
        validate: {
            validator: value => /[a-z]{4,}$/i.test(value),
            message: props => `${props.value} is not a valid username`
        },
    },
    password: { type: String, required: true, minLength: 8 }
}, { versionKey: false })

module.exports = mongoose.model('User', User);
