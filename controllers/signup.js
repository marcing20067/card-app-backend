const User = require('../models/user');
const MongoError = require('../util/mongoError');
const messages = require('../messages/messages');
const OneTimeToken = require('../models/oneTimeToken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

exports.signup = async (req, res, next) => {
    const userData = {
        isActivated: false,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    };

    try {
        const newUser = new User(userData);
        await newUser.validate();
        newUser.password = await bcrypt.hash(newUser.password, config.HASHED_PASSWORD_LENGTH);
        const createdUser = await newUser.save({ validateBeforeSave: false });
        const newOneTimeToken = new OneTimeToken({ creator: createdUser._id });
        const createdOneTimeToken = await newOneTimeToken.save();
        res.status(201).send({ message: messages.oneTimeToken.newTokenHasBeenCreated });
        createdOneTimeToken.sendEmailWithToken('activation');
    } catch (err) {
        const mongoError = new MongoError(err)
        const message = mongoError.getMessage();
        if (mongoError.isValidationError()) {
            err.statusCode = 400;
            err.message = message || messages.global.invalidData;
        }
        if (mongoError.isDuplicateError()) {
            err.statusCode = 409;
            err.message = message || messages.global.invalidData;
        }
        next(err);
    }
}
