const jwt = require("jsonwebtoken");
const messages = require("../messages/messages");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const userData = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.userData = userData;
    next();
  } catch (error) {
    error.statusCode = 401;
    error.errorMessage = messages.jwtToken.invalidAccessToken;
    throw error;
  }
};
