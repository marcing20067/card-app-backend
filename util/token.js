const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = class JwtToken {
    constructor(payload) {
        this.createTokenData(payload);
    }

    createTokenData(payload) {
        const accessToken = jwt.sign(payload, config.ACCESS_TOKEN);
        const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN);

        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    setRefreshTokenInCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken || this.refreshToken, {
            maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            httpOnly: true
        })
    }

    static setRefreshTokenInCookie(res, refreshToken) {
        this.setRefreshTokenInCookie(res, refreshToken)
    }

    static verifyRefreshToken(refreshToken) {
        const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN);
        return decoded;
    }

    getAccessTokenData() {
        return {
            accessToken: this.accessToken,
            accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        }
    }

}