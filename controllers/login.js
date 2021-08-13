const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

const login = async (req, res, next) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
    }

    try {
        const findedUser = await User.findOne(user)

        if (!findedUser) {
            return res.status(400).send({ message: 'User does not exist' });
        }

        const userDataForToken = {
            id: findedUser._id,
        }

        const accessToken = await jwt.sign(userDataForToken, config.ACCESS_TOKEN, { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS });
        const refreshToken = await jwt.sign(userDataForToken, config.REFRESH_TOKEN, { expiresIn: config.REFRESH_TOKEN_EXPIRES });

        res.cookie('refreshToken', refreshToken, {
            maxAge: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS,
            httpOnly: true
        })

        res.send({
            accessToken,
            accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        })
    } catch (error) {
        res.status(400).send({ message: '' })
    }
}

exports.login = login;