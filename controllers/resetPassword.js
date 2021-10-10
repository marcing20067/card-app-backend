const User = require('../models/user');
const OneTimeToken = require('../util/oneTimeToken');
const messages = require('../messages/messages');

exports.resetPassword = async (req, res, next) => {
    const { username } = req.body;
    try {
        const findedUser = await User.findOne({ username: username });
        if (!findedUser) {
            throw new Error(messages.user.invalidData);
        }
        const newOneTimeToken = await OneTimeToken.updateOne({ creator: findedUser._id }, findedUser._id);
        sendEmailWithLink(newOneTimeToken);
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
}

const sendEmailWithLink = (oneTimeToken) => {
    const url = oneTimeToken.createUrl('resetPassword');
    // TODO: Send email
}

exports.resetPasswordWithToken = async (req, res, next) => {
    const { resetPasswordToken } = req.params;
    const { oldPassword, newPassword } = req.body;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetPassword.token': resetPasswordToken });
        if (!findedOneTimeToken) {
            throw new Error(messages.global.invalidData);
        }
        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, password: oldPassword });
        if (!findedUser) {
            throw new Error(messages.global.invalidData);
        }
        await updatePasswordForUser({ _id: findedOneTimeToken.creator }, newPassword);
        res.send({ message: 'Password has been changed successfully.'})
    } catch (error) {
        res.status(400).send({ message: error.message });
    }

}

const updatePasswordForUser = async (filter, newPassword) => {
    const responseData = await User.updateOne(filter, { $set: { password: newPassword } });
    if(responseData.nModified === 0) {
        throw new Error('The password is the same as the previous one.')
    }
}