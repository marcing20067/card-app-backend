const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const errorTexts = require('../errorTexts/errorTexts.js');
const invalidRefreshTokenErrorText = errorTexts.controllers.refresh.invalidRefreshToken;

exports.refresh = (req, res, next) => {
    const token = req.cookies.refreshToken;

    try {
        const userData = jwt.verify(token, config.REFRESH_TOKEN)
        const tokenData = createTokenData(userData);

        setRefreshTokenInCookie(res, tokenData);

        res.status(201).send({ accessToken: tokenData.accessToken, accessTokenExpiresIn: tokenData.accessTokenExpiresIn, })
    } catch(error) {
        console.log(error);
        res.status(400).send({ message: invalidRefreshTokenErrorText })
    }
}

const createTokenData = (payload) => {
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

const setRefreshTokenInCookie = (res, tokenData) => {
    res.cookie('refreshToken', tokenData.refreshToken, {
        maxAge: tokenData.refreshTokenExpiresIn,
        httpOnly: true
    })
}