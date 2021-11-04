module.exports = (error, req, res, next) => {
    const { statusCode, message, data } = error;
    res.status(statusCode || 500).send(message ? { message } : { ...data });
}