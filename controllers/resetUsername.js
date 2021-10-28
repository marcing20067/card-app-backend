const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.resetUsername = async (req, res, next) => {
    const { username } = req.body;
    try {
        const findedUser = await User.findOne({ username });
        if (!findedUser) {
            const err = new Error(messages.user.invalidData);
            err.statusCode = 400;
            throw err;
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
    const { resetUsernameToken } = req.params;
    const { currentUsername, newUsername } = req.body;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'resetUsername.token': resetUsernameToken });
        if (!findedOneTimeToken) {
            const err = new Error(messages.global.invalidData);
            err.statusCode = 400;
            throw err;
        }

        const findedUser = await User.findOne({ _id: findedOneTimeToken.creator, username: currentUsername });
        if (!findedUser) {
            const err = new Error(messages.global.invalidData);
            err.statusCode = 400;
            throw err;
        }

        await updatePasswordForUser({ _id: findedOneTimeToken.creator }, newUsername);
        res.send({ message: 'Username has been changed successfully.' })
    } catch (err) {
        next(err)
    }
}

const updatePasswordForUser = async (filter, newUsername) => {
    const responseData = await User.updateOne(filter, { $set: { username: newUsername } });
    if (responseData.nModified === 0) {
        const err = new Error('The username is the same as the previous one.');
        err.statusCode = 400;
        throw err;
    }
}