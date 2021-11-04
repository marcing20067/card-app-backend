const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
    const payload = req.userData;
    try {
        const accessToken = jwt.sign(payload, config.ACCESS_TOKEN, {
            expiresIn: 1800
        });

        res.setHeader('x-csrf', accessToken)
        if (next) {
            next();
        }
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}