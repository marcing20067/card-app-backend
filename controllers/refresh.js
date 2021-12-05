const messages = require('../messages/messages');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const throwError = require('../util/throwError');

exports.refresh = (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            throwError({
                message: messages.jwtToken.invalidRefreshToken
            })        
        }
        
        const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN);
        if (!payload) {
            throwError({
                message: messages.jwtToken.invalidRefreshToken
            })
        }

        const newAccessToken = jwt.sign(payload, config.ACCESS_TOKEN);
        const newRefreshToken = jwt.sign(payload, config.REFRESH_TOKEN);

        res.status(201).send({
            accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
            refreshTokenExpiresIn: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        })

    } catch (err) {
        next(err);
    }
}