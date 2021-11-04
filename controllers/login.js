const User = require('../models/user');
const messages = require('../messages/messages');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const csrfToken = require('../middlewares/csrf');

exports.login = async (req, res, next) => {
    const userData = {
        username: req.body.username,
        password: req.body.password,
        isActivated: true
    }

    try {
        const findedUser = await User.findOne({ username: userData.username, isActivated: true });
        if (!findedUser) {
            const err = new Error(messages.user.invalidData);
            err.statusCode = 400;
            throw err;
        }

        const isPasswordValid = await bcrypt.compare(userData.password, findedUser.password);
        if (!isPasswordValid) {
            const err = new Error(messages.user.invalidData);
            err.statusCode = 400;
            throw err;
        }

        const payload = {
            id: findedUser._id,
        }

        const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN);

        res.cookie('refreshToken', refreshToken, {
            maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            httpOnly: true
        })

        csrfToken({ userData: payload }, res)
        res.send({
            message: 'Login successfully.'
        });
    } catch (err) {
        next(err)
    }
}

