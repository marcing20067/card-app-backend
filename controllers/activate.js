const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.activate = async (req, res, next) => {
    const { activationToken } = req.params;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'activation.token': activationToken });
        if(!findedOneTimeToken) {
            const err = new Error(messages.oneTimeToken.invalidData);
            err.statusCode = 400;
            throw err;
        }

        const oneTimeTokenHasExpired = findedOneTimeToken.hasTokenExpired('activation');
        if (oneTimeTokenHasExpired) {
            const updatedOneTimeToken = await findedOneTimeToken.makeValid();
            sendEmailWithMessage(updatedOneTimeToken)
            res.send({ message: messages.oneTimeToken.newTokenHasBeenGenerated })
        }

        if (!oneTimeTokenHasExpired) {
            await activateUserById(findedOneTimeToken.creator);
            res.send({ message: messages.oneTimeToken.tokenHasBeenUsedSuccessfully });
        }
    } catch (err) {
        next(err)
    }
}

const sendEmailWithMessage = (oneTimeToken) => {
    const url = oneTimeToken.createUrl('activation');
    // TODO: Send email
}

const activateUserById = async (userId) => {
    await User.updateOne({ _id: userId }, {
        $set: {
            isActivated: true,
        }
    })
}
