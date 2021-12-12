const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');
const config = require('../config/config');
const email = require('../util/email');
const User = require('./user')

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
    creator: { type: Schema.Types.ObjectId, required: true, unique: true }
}, { versionKey: false })

OneTimeTokenSchema.methods.createUrl = function (tokenType) {
    const frontendUrl = config.FRONTEND_URL;
    const token = this[tokenType].token;
    return `${frontendUrl}/${tokenType}/${token}`;
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

OneTimeTokenSchema.methods.sendEmailWithToken = async function (tokenType) {
    const url = this.createUrl(tokenType);
    const owner = await User.findOne({ _id: this.creator });

    // email.sendMail({
    //     to: owner.email,`
    //     from: 'marcing2067@wp.pl',
    //     subject: `Subject`,
    //     html: `<h1>${tokenType} now!</h1> Click this link to <a href="${url}">${tokenType}</a>`
    // })
}

module.exports = mongoose.model('OneTimeToken', OneTimeTokenSchema);
