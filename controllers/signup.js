const User = require('../models/user.js');
const isShortErrorAndSendErrorByResAndMessage = require('../utils/short.js');
const isRequiredErrorAndSendErrorByResAndMessage = require('../utils/isRequired.js');
const errorTexts = require('../errorTexts/errorTexts.js');
const invalidDataErrorText = errorTexts.invalidData;
const usernameTakenErrorText = errorTexts.controllers.signup.usernameTaken;

exports.signup = async (req, res, next) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    };
    try {
        const newUser = new User(user);
        const createdUser = await newUser.save();
        res.status(201).send(createdUser);
    } catch (err) {
        if (isUsernameTakenErrorAndSendErrorByResAndErr(res, err)) {
            return;
        }
        if (err.errors.username) {
            const message = err.errors.username.properties.message;
            if(isShortOrRequiredErrorAndSendErrorByResAndMessage(res, message)) {
                return;
            }
        }
        if (err.errors.password) {
            const message = err.errors.password.properties.message;
            if(isShortOrRequiredErrorAndSendErrorByResAndMessage(res, message)) {
                return;
            }
        }
        res.status(400).send({ message: invalidDataErrorText })
    }
}

const isShortOrRequiredErrorAndSendErrorByResAndMessage = (res, message) => {
    return isShortErrorAndSendErrorByResAndMessage(res, message) || isRequiredErrorAndSendErrorByResAndMessage(res, message);
}

const isUsernameTakenErrorAndSendErrorByResAndErr = (res, err) => {
    if (err.name === 'MongoError' && err.code === 11000) {
        res.status(409).send({ message: usernameTakenErrorText })
        return true;
    }
    return false;
}