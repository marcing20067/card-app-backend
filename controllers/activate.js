const OneTimeToken = require('../utils/oneTimeToken');
const User = require('../models/user');
const messages = require('../messages/messages');

exports.activate = async (req, res) => {
    const token = req.params.oneTimeToken;
    try {
        const findedOneTimeToken = await OneTimeToken.findOne(token);
        if (!findedOneTimeToken) {
            throw new Error(messages.oneTimeToken.invalidData);
        }

        const oneTimeTokenHasExpired = findedOneTimeToken.hasExpired(findedOneTimeToken);
        if (oneTimeTokenHasExpired) {
            const newOneTimeToken = await OneTimeToken.updateOne(token, findedOneTimeToken.creator);
            sendEmailWithMessage(newOneTimeToken)
            res.send({ message: messages.oneTimeToken.newTokenHasBeenGenerated })
            return;
        }

        if (findedOneTimeToken && !oneTimeTokenHasExpired) {
            const userId = findedOneTimeToken.creator;
            await changeIsActivatedToTrueForUser(userId);
            res.send({ message: messages.oneTimeToken.tokenHasBeenUsedSuccessfully });
        }
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
}

const sendEmailWithMessage = (oneTimeToken) => {
    console.log(oneTimeToken);
    const url = oneTimeToken.createUrl();
    console.log(url);
    // TODO: Send email
}

const changeIsActivatedToTrueForUser = async (userId) => {
    await User.updateOne({ _id: userId }, {
        $set: {
            isActivated: true,
        }
    })
}
