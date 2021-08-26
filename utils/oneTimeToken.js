const crypto = require('crypto');
const OneTimeToken = require('../models/oneTimeToken');

exports.createOneTimeToken = async (creator) => {
    const oneTimeTokenData = {
        creator: creator,
        token: 'token',
        endOfValidity: 0
    }
    const oneTimeToken = new OneTimeToken(oneTimeTokenData);
    const createdOneTimeToken = await oneTimeToken.save()
    return createdOneTimeToken;
}

exports.updateOneTimeToken = async (creator) => {
    // TODO: Move this to config file
    const tokenLength = 15;
    const oneTimeTokenExpiresInMinutes = 30;

    const token = generateToken(tokenLength);
    const endOfValidity = generateEndOfValidity(oneTimeTokenExpiresInMinutes);
    const oneTimeTokenData = {
        creator: creator,
        token: token,
        endOfValidity: endOfValidity
    }
    const updatedOneTimeToken = OneTimeToken.updateOne({ creator: creator }, oneTimeTokenData);
    return oneTimeTokenData;
}

const generateToken = (tokenLength) => {
    const token = crypto.randomBytes(tokenLength / 2).toString('hex');
    return token;
}
exports.generateToken = generateToken;

const generateEndOfValidity = (oneTimeTokenExpiresInMinutes) => {
    const now = new Date();
    const endOfValidity = new Date().setMinutes(now.getMinutes() + oneTimeTokenExpiresInMinutes);
    return endOfValidity;
}
exports.generateEndOfValidity = generateEndOfValidity;