const messages = require('../messages/messages');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.refresh = (req, res, next) => {
    const oldRefreshToken = req.cookies.refreshToken;
    try {
        const payload = jwt.verify(oldRefreshToken, config.REFRESH_TOKEN);
        if(!payload) {
            const err = new Error(messages.jwtToken.invalidRefreshToken);
            err.statusCode = 400;
            throw err;
        }

        const accessToken = jwt.sign(payload, config.ACCESS_TOKEN);
        const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN);
        
        res.cookie('refreshToken', refreshToken, {
            maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            httpOnly: true
        })

        res.status(201).send({
            accessToken: accessToken,
            accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        })
    } catch (err) {
        next(err);
    }
}