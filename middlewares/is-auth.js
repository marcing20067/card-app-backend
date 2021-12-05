const jwt = require('jsonwebtoken');
const config = require('../config/config');
const messages = require('../messages/messages')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const userData = jwt.verify(token, config.ACCESS_TOKEN);
        req.userData = userData;
        next();
    } catch (error) {
        console.log(error);
        error.message = messages.jwtToken.invalidAccessToken;
        throw error;
    }
}
