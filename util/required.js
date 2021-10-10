const isAnyPropertyUndefined = (object) => {
    for (const property in object) {
        if (object[property] === undefined) {
            return `${propertyName} is required.`;
        }
    }
    return false;
}

module.exports = isAnyPropertyUndefined;