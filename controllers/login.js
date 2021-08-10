const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

exports.login = (req, res, next) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    }

    User.findOne(user).then(findedUser => {
        if (findedUser) {
            const userData = {
                id: findedUser._id,
            }

            const accessToken = jwt.sign(userData, config.ACCESS_TOKEN, { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS });
            const refreshToken = jwt.sign(userData, config.REFRESH_TOKEN, { expiresIn: config.REFRESH_TOKEN_EXPIRES });

            res.cookie('refreshToken', refreshToken, {
                maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
                httpOnly: true
            })

            res.send({
                accessToken: accessToken,
                accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
            })
        }
        if (!findedUser) {
            res.status(400).send({ message: 'User does not exist' })
        }
    }).catch(err => {
        res.status(400).send({ message: '' })
    })
}