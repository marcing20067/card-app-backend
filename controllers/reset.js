const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');
const { throwError } = require('../util/throwError');
const bcrypt = require('bcryptjs');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;

    try {
        const findedUser = await User.findOne({ username: username, isActivated: true });
        if (!findedUser) {
            throwError({
                message: messages.user.invalidData,
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ creator: findedUser._id });
        await findedOneTimeToken.makeValid('resetPassword');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
        findedOneTimeToken.sendEmailWithToken('resetPassword')
    }
    catch (err) {
        next(err);
    }
}

exports.resetPasswordWithToken = async (req, res, next) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        if (token === '0') {
            throwError({
                message: messages.oneTimeToken.invalidData
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': token });
        if (!findedOneTimeToken) {
            throwError()
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, isActivated: true });
        if (!findedUser) {
            throwError()
        }

        const hashedPassword = await bcrypt.hash(newPassword, +process.env.HASHED_PASSWORD_LENGTH)
        await User.updateOne({ _id: findedOneTimeToken.creator }, { $set: { password: hashedPassword } });
        await OneTimeToken.updateOne({ _id: findedOneTimeToken._id }, {
            $set: {
                resetPassword: {
                    token: '0'
                }
            }
        })
        res.send({ message: messages.user.passwordWasChanged })
    } catch (error) {
        next(error);
    }
}


exports.resetUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const findedUser = await User.findOne({ username, isActivated: true });
        if (!findedUser) {
            throwError({
                message: messages.user.invalidData
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ creator: findedUser._id });
        await findedOneTimeToken.makeValid('resetUsername');
        findedOneTimeToken.sendEmailWithToken('resetUsername');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (err) {
        next(err);
    }
}

exports.resetUsernameWithToken = async (req, res, next) => {
    const { token } = req.params;
    const { newUsername } = req.body;

    try {
        if (token === '0') {
            throwError({
                message: messages.oneTimeToken.invalidData
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': token });
        if (!findedOneTimeToken) {
            throwError({
                message: messages.global.invalidData
            })
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, isActivated: true });
        if (!findedUser) {
            throwError({
                message: messages.global.invalidData
            })
        }

        const userWithNewUsername = await User.findOne({ username: newUsername });
        if (userWithNewUsername) {
            throwError({
                status: 409,
                message: messages.user.usernameTaken
            })
        }

        await User.updateOne({ _id: findedOneTimeToken.creator }, { $set: { username: newUsername } });
        await OneTimeToken.updateOne({ _id: findedOneTimeToken._id }, {
            $set: {
                resetUsername: {
                    token: '0'
                }
            }
        })
        res.send({ message: messages.user.usernameWasChanged })
    } catch (err) {
        next(err)
    }
}
