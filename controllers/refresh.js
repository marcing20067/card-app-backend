const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

exports.refreshToken = (req, res, next) => {
    const token = req.body.refreshToken;

    try {
        const userData = jwt.verify(token, config.REFRESH_TOKEN)
        const newAccessToken = jwt.sign(userData, config.ACCESS_TOKEN);
        const newRefreshToken = jwt.sign(userData, config.REFRESH_TOKEN);

        res.cookie('Authentication', newAccessToken, {
            maxAge: config.ACCESS_TOKEN_EXPIRESIN,
            httpOnly: true
        });

        res.send({ refreshToken: newRefreshToken })
    }
    catch (error) {
        console.log(error);
        res.status(401).send({ message: 'Invalid refresh token' })
    }
}
