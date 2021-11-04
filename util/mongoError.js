const messages = require('../messages/messages');

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
        if(this.isObjectIdError()) {
            return messages.global.invalidData;
        }

        let wrongProperty, originalMessage;
        const isValidationError = this.isValidationError();
        const isDuplicateError = this.isDuplicateError();
        if(isValidationError || isDuplicateError) {
            wrongProperty = this.getWrongProperty()
            originalMessage = this.getOriginalErrorMessage();
        }

        if (isDuplicateError) {
            return `${wrongProperty} is already taken.`
        }

        if (isValidationError) {
            if (!wrongProperty) {
                return;
            }
            if (originalMessage.includes('required')) {
                const errorMessage = `${wrongProperty} is required.`;
                return errorMessage;
            }

            if (originalMessage.includes('shorter')) {
                const errorMessage = `${wrongProperty} is too short.`;
                return errorMessage;
            }
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
        if(this.error.errors) {
            const message = this.getOriginalErrorMessage();
            return message.includes('already taken');
        }
        return false;
    }

    isObjectIdError() {
        return this.error.kind === 'ObjectId';
    }

    isValidationError() {
        return !!this.error.errors || this.isObjectIdError();
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}