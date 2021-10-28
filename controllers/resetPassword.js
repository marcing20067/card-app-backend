const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;

    try {
        const findedUser = await User.findOne({ username: username });
        if (!findedUser) {
            const err = new Error(messages.user.invalidData)
            err.statusCode = 400;
            throw err;
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
    const { resetPasswordToken } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': resetPasswordToken });
        if (!findedOneTimeToken) {
            const err = new Error(messages.global.invalidData)
            err.statusCode = 400;
            throw err;
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, password: currentPassword });
        if (!findedUser) {
            const err = new Error(messages.global.invalidData)
            err.statusCode = 400;
            throw err;
        }

        await updatePasswordForUserById(findedOneTimeToken.creator, newPassword);
        res.send({ message: messages.user.passwordWasChanged })
    } catch (error) {
        next(error);
    }
}

const updatePasswordForUserById = async (userId, newPassword) => {
    const responseData = await User.updateOne({ _id: userId }, { $set: { password: newPassword } });
    if (responseData.nModified === 0) {
        const err = new Error(messages.user.samePassword)
        err.statusCode = 400;
        throw err;
    }
}