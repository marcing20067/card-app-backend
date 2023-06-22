const { messages } = require("../messages/messages");
const jwt = require("jsonwebtoken");
const { throwError } = require("../util/throwError");

exports.refresh = (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.send({ message: messages.jwtToken.invalidRefreshToken });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    if (!payload) {
      // TODO: TEST COVERAGE
      throwError({
        message: messages.jwtToken.invalidRefreshToken,
      });
    }

    const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN);
    const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/refresh",
      maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
    });

    res.status(201).send({
      accessToken: newAccessToken,
      accessTokenExpiresIn: +process.env.ACCESS_TOKEN_EXPIRES_IN_MILISECONDS,
    });
  } catch (err) {
    err.statusCode = 400;
    err.errorMessage = messages.jwtToken.invalidRefreshToken;
    next(err);
  }
};
