const User = require('../models/user');
const messages = require('../messages/messages');
const JwtToken = require('../util/token');

exports.login = async (req, res, next) => {
    const userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        isActivated: true
    }

    try {
        const findedUser = await User.findOne(userData);
        if (!findedUser) {
            throw new Error;
        }

        const userDataPayload = {
            id: findedUser._id,
            isActivated: findedUser
        }
        const tokenData = new JwtToken(userDataPayload);
        tokenData.setRefreshTokenCookies(res);
        const accessTokenData = tokenData.getAccessTokenData();

        res.send(accessTokenData);
    } catch {
        return res.status(400).send({ message: messages.user.invalidData });
    }
}

