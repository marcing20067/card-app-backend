const crypto = require('crypto');
const OneTimeToken = require('../models/oneTimeToken');
const config = require('../config/config');

exports.createOneTimeToken = async (creator) => {
    const oneTimeTokenData = createOneTimeTokenData(creator);
    const oneTimeToken = new OneTimeToken(oneTimeTokenData);
    const createdOneTimeToken = await oneTimeToken.save()
    return createdOneTimeToken;
}

exports.generateNewOneTimeToken = async (oldToken, creator) => {
    const newOneTimeTokenData = createOneTimeTokenData(creator);
    try {
        await OneTimeToken.updateOne({ token: oldToken}, newOneTimeTokenData);
        return newOneTimeTokenData;
    } catch {
        throw new Error();
    }
}

const createOneTimeTokenData = (creator) => {
    const tokenLength = 15;
    const oneTimeTokenExpiresInWeeks = 1;

    const token = generateToken(tokenLength);
    const endOfValidity = generateEndOfValidity(oneTimeTokenExpiresInWeeks);
    const oneTimeTokenData = {
        token: token,
        endOfValidity: endOfValidity,
        creator: creator
    }

    return oneTimeTokenData;
}

const generateToken = (tokenLength) => {
    const token = crypto.randomBytes(tokenLength / 2).toString('hex');
    return token;
}

const generateEndOfValidity = (oneTimeTokenExpiresInWeeks) => {
    const now = new Date();
    const endOfValidity = new Date().setDate(now.getDate() + oneTimeTokenExpiresInWeeks * 7);
    return endOfValidity;
}

exports.createOneTimeTokenData = createOneTimeTokenData;


exports.oneTimeTokenHasExpired = (oneTimeToken) => {
    const now = Date.now();
    return now > oneTimeToken.endOfValidity;
}

const findOneTimeToken = async (token) => {
    const findedOneTimeToken = await OneTimeToken.findOne({ token: token });
    return findedOneTimeToken;
}

exports.findOneTimeToken = findOneTimeToken;

exports.createUrl = (oneTimeToken) => {
    const token = oneTimeToken.token;
    return `${config.FRONTEND_URL}/${token}`;
}
