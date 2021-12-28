const messages = require('../messages/messages');
const jwt = require('jsonwebtoken');
const throwError = require('../util/throwError');

exports.refresh = (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.send({ error: messages.jwtToken.invalidRefreshToken });
        }

        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        if (!payload) {
            throwError({
                message: messages.jwtToken.invalidRefreshToken
            })
        }

        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN);
        const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/refresh',
            maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS
        })

        res.status(201).send({
            accessToken: newAccessToken,
            accessTokenExpiresIn: +process.env.ACCESS_TOKEN_EXPIRES_IN_MILISECONDS,
        })

    } catch (err) {
        next(err);
    }
}