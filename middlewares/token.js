const jwt = require('jsonwebtoken');
const config = require('../config/config');
const messages = require('../messages/messages')

const checkTokenAndSetUserData = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userData = jwt.verify(token, config.ACCESS_TOKEN);
        req.userData = userData;
        next();
    } catch (error) {
        res.status(401).send({ message: messages.jwtToken.invalidAccessToken })
    }
}

module.exports = checkTokenAndSetUserData;