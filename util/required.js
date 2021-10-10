const isAnyPropertyUndefinedAndSendError = (res, object) => {
    for (const property in object) {
        if (object[property] === undefined) {
            const formattedPropertyName = property[0].toUpperCase() + property.slice(1);
            res.status(400).send({ message: createMessage(formattedPropertyName) });
            return true;
        }
    }
    return false;
}

const createMessage = (propertyName) => {
    return `${propertyName} is required.`;
}

module.exports = isAnyPropertyUndefinedAndSendError;