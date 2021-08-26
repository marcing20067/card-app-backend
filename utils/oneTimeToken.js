const crypto = require('crypto');

exports.generateToken = () => {
    const tokenLength = 15;
    const token = crypto.randomBytes(tokenLength / 2).toString('hex');
    return token;
}

exports.generateEndOfValidity = () => {
    const now = new Date();
    const oneTimeTokenExpiresInMinutes = 30;
    const endOfValidity = new Date().setMinutes(now.getMinutes() + oneTimeTokenExpiresInMinutes);
    return endOfValidity;
}