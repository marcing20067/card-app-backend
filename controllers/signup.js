const User = require('../models/user');
const MongoError = require('../util/mongoError');
const messages = require('../messages/messages');
const OneTimeToken = require('../models/oneTimeToken');

exports.signup = async (req, res, next) => {
    const userData = {
        isActivated: false,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };

    try {
        const createdUser = await createUser(userData);
        const createdOneTimeToken = await createOneTimeToken(createdUser._id);
        const url = createdOneTimeToken.createUrl('activation');
        console.log(url);
        res.status(201).send({ message: messages.oneTimeToken.newTokenHasBeenCreated });
    } catch (error) {
        const mongoError = new MongoError(error)
        const message = mongoError.getMessage(error);
        if (message && message.includes('taken')) {
            return res.status(409).send({ message: message })
        }
        res.status(400).send({ message: message || messages.global.invalidData })
    }
}

const createOneTimeToken = async (creator) => {
    const newOneTimeToken = new OneTimeToken({ creator: creator });
    const createdOneTimeToken = await newOneTimeToken.save();
    return newOneTimeToken;
}

const createUser = async (user) => {
    const newUser = new User(user);
    const createdUser = await newUser.save();
    return createdUser;
}
