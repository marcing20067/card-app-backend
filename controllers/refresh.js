const jwt = require('jsonwebtoken');
const config = require('../config/config');
const messages = require('../messages/messages');
const token = require('../utils/token');

exports.refresh = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        const userData = jwt.verify(refreshToken, config.REFRESH_TOKEN)
        const tokenData = token.createTokenData(userData);
        token.setRefreshTokenInCookie(res, tokenData);
        res.status(201).send({ accessToken: tokenData.accessToken, accessTokenExpiresIn: tokenData.accessTokenExpiresIn, })
    } catch {
        res.status(400).send({ message: messages.jwtToken.invalidRefreshToken })
    }
}