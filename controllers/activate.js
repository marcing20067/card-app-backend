const OneTimeToken = require('../util/oneTimeToken');
const User = require('../models/user');
const messages = require('../messages/messages');

exports.activate = async (req, res) => {
    const activationToken = req.params.activationToken;
    try {
        const findedOneTimeToken = await findOneTimeToken({ 'activation.token': activationToken });

        const oneTimeTokenHasExpired = findedOneTimeToken.hasTokenExpired('activation');
        if (oneTimeTokenHasExpired) {
            const newOneTimeToken = await OneTimeToken.updateOne({ 'activation.token': activationToken }, findedOneTimeToken.creator);
            sendEmailWithMessage(newOneTimeToken)
            res.send({ message: messages.oneTimeToken.newTokenHasBeenGenerated })
            return;
        }
        if (!oneTimeTokenHasExpired) {
            const userId = findedOneTimeToken.creator;
            await changeIsActivatedToTrueForUser(userId);
            res.send({ message: messages.oneTimeToken.tokenHasBeenUsedSuccessfully });
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

const findOneTimeToken = async (filter) => {
    const findedOneTimeToken = await OneTimeToken.findOne(filter);
    if (!findedOneTimeToken) {
        throw new Error(messages.oneTimeToken.invalidData);
    }
    return findedOneTimeToken;
}

const sendEmailWithMessage = (oneTimeToken) => {
    const url = oneTimeToken.createUrl('activation');
    // TODO: Send email
}

const changeIsActivatedToTrueForUser = async (userId) => {
    await User.updateOne({ _id: userId }, {
        $set: {
            isActivated: true,
        }
    })
}
