const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');
const messages = require('../messages/messages');

exports.activate = async (req, res) => {
    const activationToken = req.params.activationToken;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne({ 'activation.token': activationToken });
        if(!findedOneTimeToken) {
            throw new Error();
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
    } catch (error) {
        res.status(400).send({ message: messages.oneTimeToken.invalidData })
    }
}

const sendEmailWithMessage = (oneTimeToken) => {
    const url = oneTimeToken.createUrl('activation');
    // TODO: Send email
}

const activateUserById = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $set: {
            isActivated: true,
        }
    })
}
