const User = require('../models/user.js');
const isAnyPropertyUndefinedAndSendError = require('../utils/required.js');
const errorTexts = require('../errorTexts/errorTexts.js');
const loginInvalidDataErrorText = errorTexts.controllers.login.invalidData;
const token = require('../utils/token.js');
const oneTimeTokenFunctions = require('../utils/oneTimeToken.js');

exports.login = async (req, res, next) => {
    const userData = {
        email: req.body.email,
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
            isActivated: findedUser
        }
        const tokenData = token.createTokenData(userDataForToken);

        token.setRefreshTokenInCookie(res, tokenData);

        const accessTokenData = {
            accessToken: tokenData.accessToken,
            accessTokenExpiresIn: tokenData.accessTokenExpiresIn,
        }

        if (!findedUser.isActivated) {
            const oneTimeToken = updateOneTimeToken(res, findedUser, accessTokenData);
            if (oneTimeToken) {
                return;
            }
        }

        res.send(accessTokenData);
    } catch {
        return res.status(400).send({ message: loginInvalidDataErrorText });
    }
}

const updateOneTimeToken = async (res, userData, accessTokenData) => {
    const creator = userData._id;
    const oneTimeToken = await oneTimeTokenFunctions.updateOneTimeToken(creator);
    if (oneTimeToken) {
        res.send({ message: 'Check your email.', ...accessTokenData });
        return oneTimeToken;
    }
    if (!oneTimeToken) {
        throw new Error;
    }
}

const findUser = async (userData) => {
    const findedUser = await User.findOne(userData)
    if (!findedUser) {
        throw new Error;
    }
    return findedUser;
}