
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
        if (this.isObjectIdError()) {
            // No custom error message;
            return;
        }

        const isDuplicateError = this.isDuplicateError();

        if (isDuplicateError) {
            const wrongKey = Object.keys(this.error.keyPattern)[0];
            return `${this.capitalizeFirstLetter(wrongKey)} is already taken.`
        }

        const isValidationError = this.isValidationError();

        if (isValidationError) {

            const wrongProperty = this.getWrongProperty()
            const originalMessage = this.getOriginalErrorMessage();

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
        return this.error.code === 11000;
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

class Property {
    constructor(value) {
        this.value = value;
    }
}