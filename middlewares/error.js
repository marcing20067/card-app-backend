const messages = require('../messages/messages')

module.exports = (error, req, res, next) => {
    const { statusCode, errorMessage } = error;
    res.status(statusCode || 500).send({ message: errorMessage || messages.global.invalidData});
}