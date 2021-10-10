const messages = require('../messages/messages');
const JwtToken = require('../util/token');

exports.refresh = (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    try {
        const userData = JwtToken.verifyRefreshToken(refreshToken);
        console.log(userData);
        const tokenData = new JwtToken(userData);
        const accessTokenData = tokenData.getAccessTokenData(tokenData);
        res.status(201).send({ ...accessTokenData })
    } catch(error) {
        console.log(error);
        res.status(400).send({ message: messages.jwtToken.invalidRefreshToken })
    }
}