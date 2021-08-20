const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const errorTexts = require('../errorTexts/errorTexts.js')
const invalidAuthErrorMessage = errorTexts.invalidAuth;

const checkTokenValidityAndSetUserData = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userData = jwt.verify(token, config.ACCESS_TOKEN);
        req.userData = userData;
        next();
    } catch (error) {
        res.status(401).send({ message: invalidAuthErrorMessage })
    }
}

module.exports = checkTokenValidityAndSetUserData;