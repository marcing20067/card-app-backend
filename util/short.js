const isShortErrorAndSendError = (res, message) => {
    if (message.includes('shorter')) {
        const propertyName = message.split('`')[1];
        const formattedPropertyName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
        res.status(400).send({ message: `${formattedPropertyName} is too short.` });
        return true;
    }
    return false;
}

module.exports = isShortErrorAndSendError;