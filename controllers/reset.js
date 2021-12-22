const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');
const throwError = require('../util/throwError');
const bcrypt = require('bcryptjs');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;

    try {
        const findedUser = await User.findOne({ username: username });
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
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': token });
        if (!findedOneTimeToken) {
            throwError()
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator });
        if (!findedUser) {
            throwError()
        }

        const hashedPassword = await bcrypt.hash(newPassword, +process.env.HASHED_PASSWORD_LENGTH)
        const responseData = await User.updateOne({ _id: findedOneTimeToken.creator }, { $set: { password: hashedPassword } });
        res.send({ message: messages.user.passwordWasChanged })
    } catch (error) {
        next(error);
    }
}


exports.resetUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const findedUser = await User.findOne({ username });
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
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': token });
        if (!findedOneTimeToken) {
            throwError({
                message: messages.global.invalidData
            })
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator });
        if (!findedUser) {
            throwError({
                message: messages.global.invalidData
            })
        }

        if (findedOneTimeToken && findedUser) {
            const responseData = await User.updateOne({ _id: findedOneTimeToken.creator }, { $set: { username: newUsername } });
            res.send({ message: 'Username has been changed successfully.' })
        }
    } catch (err) {
        next(err)
    }
}
