const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.activate = async (req, res) => {
    const activationToken = req.params.activationToken;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'activation.token': activationToken });
        const oneTimeTokenHasExpired = findedOneTimeToken.hasTokenExpired('activation');
        if (oneTimeTokenHasExpired) {
            const updatedOneTimeToken = await findedOneTimeToken.makeValid();
            sendEmailWithMessage(updatedOneTimeToken)
            res.send({ message: messages.oneTimeToken.newTokenHasBeenGenerated })
            return;
        }
        if (!oneTimeTokenHasExpired) {
            const userId = findedOneTimeToken.creator;
            await changeIsActivatedToTrueForUser(userId);
            res.send({ message: messages.oneTimeToken.tokenHasBeenUsedSuccessfully });
        }
    } catch (error) {
        res.status(400).send({ message: messages.oneTimeToken.invalidData })
    }
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
