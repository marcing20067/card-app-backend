const messages = require('../messages/messages');
const JwtToken = require('../util/token');

exports.refresh = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        const userData = JwtToken.verifyRefreshToken(refreshToken);
        if(!userData) {
            const err = new Error(messages.jwtToken.invalidRefreshToken);
            err.statusCode = 400;
            throw err;
        }
        const tokenData = new JwtToken(userData);
        const accessTokenData = tokenData.getAccessTokenData(tokenData);
        res.status(201).send(accessTokenData)
    } catch (err) {
        throw err;
    }
}