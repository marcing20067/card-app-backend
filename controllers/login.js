const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const isAnyPropertyUndefinedAndSendError = require('../utils/required.js');
const errorTexts = require('../errorTexts/errorTexts.js');
const loginInvalidDataErrorText = errorTexts.controllers.login.invalidData;

exports.login = async (req, res, next) => {
    const userData = {
        username: req.body.username,
        password: req.body.password,
    }

    if (isAnyPropertyUndefinedAndSendError(res, userData)) {
        return;
    }

    try {
        const findedUser = await findUser(userData);

        const userDataForToken = {
            id: findedUser._id,
        }

        const tokenData = createTokenData(userDataForToken);

        setRefreshTokenInCookie(res, tokenData);

        res.send({
            accessToken: tokenData.accessToken,
            accessTokenExpiresIn: tokenData.accessTokenExpiresIn,
        })
    } catch {
        return res.status(400).send({ message: loginInvalidDataErrorText });
    }
}

const findUser = async (userData) => {
    const findedUser = await User.findOne(userData)
    if (!findedUser) {
        throw new Error;
    }
    return findedUser;
}

const createTokenData = (payload) => {
    const accessToken = jwt.sign(payload, config.ACCESS_TOKEN, { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS });
    const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN, { expiresIn: config.REFRESH_TOKEN_EXPIRES });

    const tokenData = {
        accessToken: accessToken,
        accessTokenExpiresIn: config.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
        refreshToken: refreshToken,
        refreshTokenExpiresIn: config.REFRESH_TOKEN_EXPIRES_IN_MILISECONDS
    }

    return tokenData;
}

const setRefreshTokenInCookie = (res, tokenData) => {
    res.cookie('refreshToken', tokenData.refreshToken, {
        maxAge: tokenData.refreshTokenExpiresIn,
        httpOnly: true
    })
}