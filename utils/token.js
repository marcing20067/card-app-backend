const jwt = require('jsonwebtoken'); 
const config = require('../config/config.js');

exports.createTokenData = (payload) => {
    const accessToken = jwt.sign(payload, config.ACCESS_TOKEN);
    const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN);

    const tokenData = {
        accessToken: accessToken,
        accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        refreshToken: refreshToken,
        refreshTokenExpiresIn: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS
    }

    return tokenData;
}

exports.setRefreshTokenInCookie = (res, tokenData) => {
    res.cookie('refreshToken', tokenData.refreshToken, {
        maxAge: tokenData.refreshTokenExpiresIn,
        httpOnly: true
    })
}