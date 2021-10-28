module.exports = (err, req, res, next) => {
    const { statusCode, message, data } = err;

    res.status(statusCode || 500).send(message ? { message } : { ...data });
}