module.exports = class MongoError {
    constructor(error) {
        this.error = error;
    }

    getMessage() {
        if (!this.error.errors) {
            return null;
        }

        const capitalizeFirstLetter = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        const errors = Object.values(this.error.errors);
        const originalMessage = errors[0].properties.message;
        const wrongProperty = originalMessage.split('`')[1];
        const formattedProperty = capitalizeFirstLetter(wrongProperty);

        let errorMessage;
        if (originalMessage.includes('required')) {
            errorMessage = `${formattedProperty} is required.`;
        }

        if (originalMessage.includes('shorter')) {
            errorMessage = `${formattedProperty} is too short.`;
        }
        return errorMessage;
    }
}