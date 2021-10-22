const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.resetUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const findedUser = await User.findOne({ username });
        if (!findedUser) {
            throw new Error;
        }

        const newOneTimeToken = await new OneTimeToken({ creator: findedUser._id });
        newOneTimeToken.sendEmailWithToken('resetUsername');
        res.send({ message: messages.oneTimeToken.newTokenHasBeenCreated })
    }
    catch (error) {
        res.status(400).send({ message: messages.user.invalidData })
    }
}

exports.resetUsernameWithToken = async (req, res, next) => {
    const { resetUsernameToken } = req.params;
    const { currentUsername, newUsername } = req.body;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': resetUsernameToken });
        if (!findedOneTimeToken) {
            throw new Error;
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, username: currentUsername });
        if (!findedUser) {
            throw new Error;
        }

        await updatePasswordForUser({ _id: findedOneTimeToken.creator }, newUsername);
        res.send({ message: 'Username has been changed successfully.' })
    } catch (error) {
        res.status(400).send({ message: error.message || messages.global.invalidData });
    }
}

const updatePasswordForUser = async (filter, newUsername) => {
    const responseData = await User.updateOne(filter, { $set: { username: newUsername } });
    if (responseData.nModified === 0) {
        throw new Error('The username is the same as the previous one.')
    }
}