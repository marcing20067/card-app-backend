const User = require('../models/user.js');
const signupErrorMessages = require('../errorTexts/controllersTexts/signup.js')

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
        if (err.name === 'MongoError' && err.code === 11000) {
            return res.status(409).send({ message: signupErrorMessages.usernameTaken })
        }
        if (err.errors.username) {
            const message = err.errors.username.properties.message;
            if(isRequiredError(message)) {
                return res.status(400).send({ message: signupErrorMessages.requiredUsername });
            }
            if(isShortError(message)) {
                return res.status(400).send({ message: signupErrorMessages.tooShortUsername})
            }
        }
        if (err.errors.password) {
            const message = err.errors.password.properties.message;
            if(isRequiredError(message)) {
                return res.status(400).send({ message: signupErrorMessages.requiredPassword });
            }
            if(isShortError(message)) {
                return res.status(400).send({ message: signupErrorMessages.tooShortPassword })
            }
        }
        res.status(400).send({ message: signupErrorMessages.invalidData })
    }
}

const isRequiredError = (message) => {
    return message.includes('required');
}

const isShortError = (message) => {
    return message.includes('shorter');
}