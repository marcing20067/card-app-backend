const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;

    try {
        const findedUser = await User.findOne({ username: username });
        if (!findedUser) {
            throw new Error;
        }

        const newOneTimeToken = new OneTimeToken({ creator: findedUser._id });
        newOneTimeToken.sendEmailWithToken('resetPassword');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (error) {
        res.status(400).send({ message: messages.user.invalidData })
    }
}

exports.resetPasswordWithToken = async (req, res, next) => {
    const { resetPasswordToken } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': resetPasswordToken });
        if (!findedOneTimeToken) {
            throw new Error;
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, password: currentPassword });
        if (!findedUser) {
            throw new Error;
        }

        await updatePasswordForUserById(findedOneTimeToken.creator, newPassword);
        res.send({ message: 'Password has been changed successfully.' })
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message || messages.global.invalidData });
    }
}

const updatePasswordForUserById = async (userId, newPassword) => {
    const responseData = await User.updateOne({ _id: userId }, { $set: { password: newPassword } });
    if (responseData.nModified === 0) {
        throw new Error('The password is the same as the previous one.')
    }
}