const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');
const throwError = require('../util/throwError');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;

    try {
        const findedUser = await User.findOne({ username: username });
        if (!findedUser) {
            throwError({
                message: messages.user.invalidData,
            })
        }

        const newOneTimeToken = new OneTimeToken({ creator: findedUser._id });
        newOneTimeToken.sendEmailWithToken('resetPassword');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (err) {
        next(err);
    }
}

exports.resetPasswordWithToken = async (req, res, next) => {
    const { token } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        if (currentPassword === newPassword) {
            throwError({
                message: messages.user.samePassword
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': token });
        if (!findedOneTimeToken) {
            throwError()
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, password: currentPassword });
        if (!findedUser) {
            throwError()
        }

        if (findedOneTimeToken && findedUser) {
            const responseData = await User.updateOne({ _id: findedOneTimeToken.creator }, { $set: { password: newPassword } });
            res.send({ message: messages.user.passwordWasChanged })
        }
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

        const newOneTimeToken = new OneTimeToken({ creator: findedUser._id });
        newOneTimeToken.sendEmailWithToken('resetUsername');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (err) {
        next(err);
    }
}

exports.resetUsernameWithToken = async (req, res, next) => {
    const { token } = req.params;
    const { currentUsername, newUsername } = req.body;

    try {
        if (currentUsername === newUsername) {
            throwError({
                message: 'The username is the same as the previous one.'
            })
        }

        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': token });
        if (!findedOneTimeToken) {
            throwError({
                message: messages.global.invalidData
            })
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, username: currentUsername });
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
