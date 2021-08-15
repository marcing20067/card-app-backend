const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const refreshErrorMessages = require('../errorTexts/controllersTexts/refresh.js');

const createAndSetRefreshToken = async (req, res, next) => {
    const token = req.cookies.refreshToken;

    try {
        const userData = jwt.verify(token, config.REFRESH_TOKEN)
        const newAccessToken = jwt.sign(userData, config.ACCESS_TOKEN);
        const newRefreshToken = jwt.sign(userData, config.REFRESH_TOKEN);

        res.cookie('refreshToken', newRefreshToken, {
            maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            httpOnly: true
        });

        res.status(201).send({ accessToken: newAccessToken, accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS, })
    }
    catch (error) {
        res.status(400).send({ message: refreshErrorMessages.invalidData })
    }
}

exports.refreshToken = createAndSetRefreshToken;