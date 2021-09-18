const User = require('../models/user');
const OneTimeToken = require('../utils/oneTimeToken');
const messages = require('../messages/messages');

exports.resetUsername = async (req, res, next) => {
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
    const url = oneTimeToken.createUrl('resetUsername');
    // TODO: Send email
}

exports.resetUsernameWithToken = async (req, res, next) => {
    const { resetUsernameToken } = req.params;
    const { oldUsername, newUsername } = req.body;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': resetUsernameToken });
        if (!findedOneTimeToken) {
            throw new Error(messages.global.invalidData);
        }
        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, username: oldUsername });
        if (!findedUser) {
            throw new Error(messages.global.invalidData);
        }
        await updatePasswordForUser({ _id: findedOneTimeToken.creator }, newUsername);
        res.send({ message: 'Username has been changed successfully.'})
    } catch (error) {
        res.status(400).send({ message: error.message });
    }

}

const updatePasswordForUser = async (filter, newUsername) => {
    const responseData = await User.updateOne(filter, { $set: { username: newUsername } });
    if(responseData.nModified === 0) {
        throw new Error('The username is the same as the previous one.')
    }
}