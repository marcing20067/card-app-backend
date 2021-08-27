const oneTimeTokenFunctions = require('../utils/oneTimeToken');
const errorTexts = require('../errorTexts/errorTexts');
const invalidDataErrorText = errorTexts.invalidData;
const User = require('../models/user');

exports.activate = async (req, res) => {
    const token = req.params.oneTimeToken;
    try {
        const findedOneTimeToken = await oneTimeTokenFunctions.findOneTimeToken(token);
        if (!findedOneTimeToken) {
            throw new Error('Token does not exist.');
        }
        const oneTimeTokenHasExpired = oneTimeTokenFunctions.oneTimeTokenHasExpired(token);
        if (oneTimeTokenHasExpired) {
            const newOneTimeToken = oneTimeTokenFunctions.generateNewOneTimeToken(token);
            const url = oneTimeTokenFunctions.createUrl(newOneTimeToken);
            res.send({ message: 'The previous token has expired. Check the email and go to the new link.' })
            return;
        }
        const userId = findedOneTimeToken.creator;
        await changeIsActivatedToTrueForUser(userId);
        res.send({ message: 'The user has been activated successfully.' });

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message || invalidDataErrorText })
    }
}

const changeIsActivatedToTrueForUser = async (userId) => {
    await User.updateOne({ _id: userId }, {
        $set: {
            isActivated: true,
        }
    })
}
