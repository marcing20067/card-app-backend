const mongoose = require('mongoose');
const { Schema } = mongoose;

const OneTimeTokenSchema = new Schema({
    token: { type: String, unique: true, required: true},
    endOfValidity: { type: Number, required: true},
    creator: { type: String, required: true }
})

module.exports = mongoose.model('OneTimeToken', OneTimeTokenSchema);
