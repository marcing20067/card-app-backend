const messages = require('../messages/messages')

module.exports = (data = {}) => {
    const err = new Error(data.message);
    err.statusCode = data.status || 400;
    err.errorMessage = data.message || messages.global.invalidData;
    throw err;
}