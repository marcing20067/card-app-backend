const crypto = require('crypto');
const OneTimeTokenModel = require('../models/oneTimeToken');
const config = require('../config/config');

module.exports = class OneTimeToken {
    constructor(creator, token, endOfValidity) {
        this.creator = creator;
        this.token = token || this.generateToken();
        this.endOfValidity = endOfValidity || this.generateEndOfValidity();
    }

    generateToken() {
        const tokenLength = config.ONE_TIME_TOKEN_LENGTH;
        const token = crypto.randomBytes(tokenLength / 2).toString('hex');
        return token;
    }

    generateEndOfValidity() {
        const oneTimeTokenExpiresInWeeks = config.ONE_TIME_TOKEN_EXPIRES_IN_WEEKS;
        const now = new Date();
        const endOfValidity = new Date().setDate(now.getDate() + oneTimeTokenExpiresInWeeks * 7);
        return endOfValidity;
    }

    createUrl() {
        const frontendUrl = config.FRONTEND_URL;
        return `${frontendUrl}/${this.token}`;
    }

    hasExpired(oneTimeToken) {
        const now = Date.now();
        return now > oneTimeToken.endOfValidity;
    }

    async save() {
        const oneTimeToken = new OneTimeTokenModel(this);
        await oneTimeToken.save()
    }

    static async findOne(token) {
        const findedOneTimeToken = await OneTimeTokenModel.findOne({ token: token });
        if (findedOneTimeToken) {
            const oneTimeToken = new OneTimeToken(findedOneTimeToken.creator, findedOneTimeToken.token, findedOneTimeToken.endOfValidity);
            return oneTimeToken;
        }
    }

    static async updateOne(oldToken, creator) {
        const newOneTimeToken = new OneTimeToken(creator);
        await OneTimeTokenModel.updateOne({ token: oldToken }, newOneTimeToken);
        return newOneTimeToken;
    }
}
