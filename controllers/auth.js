const { User } = require("../models/user");
const { MongoError } = require("../util/mongoError");
const { messages } = require("../messages/messages");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OneTimeToken } = require("../models/oneTimeToken");
const { throwError } = require("../util/throwError");

exports.login = async (req, res, next) => {
  const { password, username } = req.body;
  const rememberMe = req.query.rememberMe || "false";

  try {
    const foundUser = await User.findOne({
      username: username,
      isActivated: true,
    });
    if (!foundUser) {
      throwError({
        message: messages.user.invalidData,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throwError({
        message: messages.user.invalidData,
      });
    }
    const payload = {
      _id: foundUser._id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN_MILISECONDS,
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
    });

    if (rememberMe === "true") {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/refresh",
        maxAge: +process.env.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
      });
    }

    res.send({
      accessToken: accessToken,
      accessTokenExpiresIn: +process.env.ACCESS_TOKEN_EXPIRES_IN_MILISECONDS,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      path: "/refresh",
      sameSite: "lax",
      httpOnly: true,
    });

    res.send({ message: messages.user.logoutSuccessfully });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const newUser = new User({
      username: username,
      password: password,
      email: email,
      isActivated: false,
    });

    await newUser.validate();
    newUser.password = await bcrypt.hash(
      password,
      +process.env.HASHED_PASSWORD_LENGTH
    );

    const createdUser = await newUser.save({ validateBeforeSave: false });
    const newOneTimeToken = new OneTimeToken({ creator: createdUser._id });
    const createdOneTimeToken = await newOneTimeToken.save();
    await createdOneTimeToken.sendEmailWithToken("activation");
    res
      .status(201)
      .send({ message: messages.oneTimeToken.newTokenHasBeenCreated });
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();

    const isDuplicateError = mongoError.isDuplicateError();
    if (message) {
      err.statusCode = isDuplicateError ? 409 : 400;
      err.errorMessage = message;
    }
    next(err);
  }
};

exports.activate = async (req, res, next) => {
  const { token } = req.params;
  try {
    // TODO: TEST COVERAGE
    if (!token) {
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    const  oneTimeToken = await OneTimeToken.findOne({
      "activation.token": token,
    });
    if (!oneTimeToken) {
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    if (oneTimeToken.activation.token !== token) {
    // TODO: TEST COVERAGE
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    const user = await User.findOne({
      _id: oneTimeToken.creator,
      isActivated: false,
    });

    if (!user) {
      throwError({
        message: messages.global.invalidData,
      });
    }

    const oneTimeTokenHasExpired = oneTimeToken.hasTokenExpired("activation");
    if (oneTimeTokenHasExpired) {
      const updatedOneTimeToken = await oneTimeToken.makeValid("activation");
      updatedOneTimeToken.sendEmailWithToken("activation");
      res.send({ message: messages.oneTimeToken.newTokenHasBeenGenerated });
    }

    if (!oneTimeTokenHasExpired) {
      await User.updateOne(
        { _id: oneTimeToken.creator },
        {
          $set: {
            isActivated: true,
          },
        }
      );
      await OneTimeToken.updateOne(
        { _id: oneTimeToken._id },
        {
          $set: {
            activation: null,
          },
        }
      );
      res.send({
        message: messages.oneTimeToken.tokenHasBeenUsedSuccessfully,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  const userId = req.userData._id;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throwError();
    }

    res.send({
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();
    if (message) {
      err.statusCode = 400;
      err.errorMessage = message;
    }
    next(err);
  }
};
