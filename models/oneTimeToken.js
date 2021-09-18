const mongoose = require('mongoose');
const { Schema } = mongoose;

const OneTimeTokenSchema = new Schema({
    resetPassword: { 
        type: {
            token: { type: String, unique: true, required: true},
            endOfValidity: { type: Number, required: true},
        },
        required: true
    },
    resetNickname: { 
        type: {
            token: { type: String, unique: true, required: true},
            endOfValidity: { type: Number, required: true},
        },
        required: true
    },
    activation: { 
        type: {
            token: { type: String, unique: true, required: true},
            endOfValidity: { type: Number, required: true},
        },
        required: true
    },
    creator: { type: String, required: true, unique: true}
}, { versionKey: false })

module.exports = mongoose.model('OneTimeToken', OneTimeTokenSchema);
