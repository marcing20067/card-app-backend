const User = require('../models/user');
const isAnyPropertyUndefinedAndSendError = require('../util/required');
const messages = require('../messages/messages');
const JwtToken = require('../util/token');

exports.login = async (req, res, next) => {
    const userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        isActivated: true
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
        const tokenData = new JwtToken(userDataForToken);
        tokenData.setRefreshTokenInCookie(res);
        const accessTokenData = tokenData.getAccessTokenData();

        res.send(accessTokenData);
    } catch {
        return res.status(400).send({ message: messages.user.invalidData });
    }
}

const findUser = async (userData) => {
    const findedUser = await User.findOne(userData)
    if (!findedUser) {
        throw new Error;
    }
    return findedUser;
}