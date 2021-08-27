const User = require('../models/user.js');
const isShortErrorAndSendError = require('../utils/short.js');
const errorTexts = require('../errorTexts/errorTexts.js');
const isAnyPropertyUndefinedAndSendError = require('../utils/required.js');
const invalidDataErrorText = errorTexts.invalidData;
const usernameTakenErrorText = errorTexts.controllers.signup.usernameTaken;
const oneTimeTokenFunctions = require('../utils/oneTimeToken.js');

exports.signup = async (req, res, next) => {
    const userData = {
        isActivated: false,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };
    if(isAnyPropertyUndefinedAndSendError(res, userData)){
        return;
    }
    try {
        const createdUser = await createUser(userData);
        const createdOneTimeToken = await createOneTimeToken(createdUser._id);
        res.status(201).send({ message: 'Check your email.'});
    } catch (err) {
        if (isUsernameTakenErrorAndSendError(res, err)) {
            return;
        }
        if (err.errors.username) {
            const message = err.errors.username.properties.message;
            if (isShortErrorAndSendError(res, message)) {
                return;
            }
        }
        if (err.errors.password) {
            const message = err.errors.password.properties.message;
            if (isShortErrorAndSendError(res, message)) {
                return;
            }
        }
        res.status(400).send({ message: invalidDataErrorText })
    }
}

const createOneTimeToken = async (creator) => {
    const oneTimeToken = await oneTimeTokenFunctions.createOneTimeToken(creator);
    const url = oneTimeTokenFunctions.createUrl(oneTimeToken);
    console.log(url);
    return oneTimeToken;
}

const createUser = async (user) => {
    const newUser = new User(user);
    const createdUser = await newUser.save();
    return createdUser;
}

const isUsernameTakenErrorAndSendError = (res, err) => {
    if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).send({ message: usernameTakenErrorText })
        return true;
    }
    return false;
}

