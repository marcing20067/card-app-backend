const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');
const config = require('../config/config');

const generateTokenData = () => {
    return {
        token: generateToken(),
        endOfValidity: generateEndOfValidity(),
    }
}

const generateToken = () => {
    const tokenLength = config.ONE_TIME_TOKEN_LENGTH;
    const token = crypto.randomBytes(tokenLength / 2).toString('hex');
    return token;
}

const generateEndOfValidity = () => {
    const oneTimeTokenExpiresInWeeks = config.ONE_TIME_TOKEN_EXPIRES_IN_WEEKS;
    const now = new Date();
    const endOfValidity = new Date().setDate(now.getDate() + oneTimeTokenExpiresInWeeks * 7);
    return endOfValidity;
}

const OneTimeTokenSchema = new Schema({
    resetPassword: {
        type: {
            token: { type: String, unique: true, required: true },
            endOfValidity: { type: Number, required: true },
        },
        required: true,
        default: generateTokenData
    },
    resetUsername: {
        type: {
            token: { type: String, unique: true, required: true },
            endOfValidity: { type: Number, required: true },
        },
        required: true,
        default: generateTokenData
    },
    activation: {
        type: {
            token: { type: String, unique: true, required: true },
            endOfValidity: { type: Number, required: true },
        },
        default: generateTokenData,
        required: true
    },
    creator: { type: String, required: true, unique: true }
}, { versionKey: false })

OneTimeTokenSchema.methods.createUrl = function (tokenType) {
    const frontendUrl = config.FRONTEND_URL;
    const token = this[tokenType].token;
    return `${frontendUrl}/${token}`;
}

OneTimeTokenSchema.methods.hasTokenExpired = function (tokenType) {
    const now = Date.now();
    return now > this[tokenType].endOfValidity;
}

OneTimeTokenSchema.methods.makeValid = async function () {
    this.resetPassword = generateTokenData();
    this.resetUsername = generateTokenData();
    this.activation = generateTokenData();
    const updatedOneTimeToken = await this.save();
    return updatedOneTimeToken;
}

OneTimeTokenSchema.methods.sendEmailWithToken = function (tokenType) {
    const url = this.createUrl(tokenType);
    // console.log(url);
}

module.exports = mongoose.model('OneTimeToken', OneTimeTokenSchema);
