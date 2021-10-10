module.exports = class MongoError {
    constructor(error) {
        this.error = error;
    }

    getOriginalErrorMessage() {
        const errors = Object.values(this.error.errors);
        const originalMessage = errors[0].properties.message;
        return originalMessage;
    }

    getMessage() {
        if (this.isDuplicateError()) {
            const duplicatedProperty = Object.keys(this.error.keyValue)[0];
            const formattedProperty = this.capitalizeFirstLetter(duplicatedProperty);
            return `${formattedProperty} is already taken.`
        }

        if (this.error.errors) {
            const wrongProperty = this.getWrongProperty()
            if (!wrongProperty) {
                return;
            }
            const originalMessage = this.getOriginalErrorMessage();
            if (originalMessage.includes('required')) {
                const errorMessage = `${wrongProperty} is required.`;
                return errorMessage;
            }

            if (originalMessage.includes('shorter')) {
                const errorMessage = `${wrongProperty} is too short.`;
                return errorMessage;
            }

            return errorMessage;
        }
    }

    getWrongProperty() {
        const originalMessage = this.getOriginalErrorMessage();
        const wrongProperty = originalMessage.split('`')[1];
        if (!wrongProperty) {
            return;
        }
        if (wrongProperty) {
            const formattedProperty = this.capitalizeFirstLetter(wrongProperty);
            return formattedProperty;
        }
    }

    isDuplicateError() {
        return this.error.code === 11000;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}