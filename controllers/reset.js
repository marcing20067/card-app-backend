const { User } = require("../models/user");
const { OneTimeToken } = require("../models/oneTimeToken");
const { messages } = require("../messages/messages");
const { throwError } = require("../util/throwError");
const bcrypt = require("bcryptjs");

exports.resetPassword = async (req, res, next) => {
  const { username } = req.body;

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

    const foundOneTimeToken = await OneTimeToken.findOne({
      creator: foundUser._id,
    });
    await foundOneTimeToken.makeValid("resetPassword");
    await foundOneTimeToken.sendEmailWithToken("resetPassword");
    res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated });
  } catch (err) {
    next(err);
  }
};

exports.resetPasswordWithToken = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    if (!token) {
      // TEST COVERAGE
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    const foundOneTimeToken = await OneTimeToken.findOne({
      "resetPassword.token": token,
    });
    if (!foundOneTimeToken) {
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      +process.env.HASHED_PASSWORD_LENGTH
    );
    await User.updateOne(
      { _id: foundOneTimeToken.creator },
      { $set: { password: hashedPassword } }
    );
    await OneTimeToken.updateOne(
      { _id: foundOneTimeToken._id },
      {
        $set: {
          resetPassword: null,
        },
      }
    );
    res.send({ message: messages.user.passwordWasChanged });
  } catch (error) {
    next(error);
  }
};

exports.resetUsername = async (req, res, next) => {
  const { username } = req.body;
  try {
    const foundUser = await User.findOne({ username, isActivated: true });
    if (!foundUser) {
      throwError({
        message: messages.user.invalidData,
      });
    }

    const foundOneTimeToken = await OneTimeToken.findOne({
      creator: foundUser._id,
    });
    await foundOneTimeToken.makeValid("resetUsername");
    await foundOneTimeToken.sendEmailWithToken("resetUsername");
    res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated });
  } catch (err) {
    next(err);
  }
};

exports.resetUsernameWithToken = async (req, res, next) => {
  const { token } = req.params;
  const { newUsername } = req.body;

  try {
    if (!token) {
      throwError({
        message: messages.oneTimeToken.invalidData,
      });
    }

    const foundOneTimeToken = await OneTimeToken.findOne({
      "resetUsername.token": token,
    });
    if (!foundOneTimeToken) {
      throwError({
        message: messages.global.invalidData,
      });
    }

    const userWithNewUsername = await User.findOne({ username: newUsername });
    if (userWithNewUsername) {
      throwError({
        status: 409,
        message: messages.user.usernameTaken,
      });
    }

    await User.updateOne(
      { _id: foundOneTimeToken.creator },
      { $set: { username: newUsername } }
    );
    await OneTimeToken.updateOne(
      { _id: foundOneTimeToken._id },
      {
        $set: {
          resetUsername: null,
        },
      }
    );
    res.send({ message: messages.user.usernameWasChanged });
  } catch (err) {
    next(err);
  }
};
