const { Error } = require("mongoose");
const { messages } = require("../messages/messages");

exports.MongoError = class MongoError {
  constructor(error) {
    this.error = error;
  }

  getMessage() {
    if (this.isDuplicateError()) {
      const wrongKey = this.getFirstProperty(this.error.keyPattern);
      return `${this.capitalizeFirstLetter(wrongKey)} is already taken.`;
    }

    if (this.error instanceof Error.CastError) {
      return messages.global.invalidData;
    }

    const errors = this.error.errors;
    if (!errors) {
      return;
    }

    const wrongProperty = this.getFirstProperty(errors);
    const error = this.error.errors[wrongProperty];

    if (error instanceof Error.ValidatorError) {
      const formattedWrongProperty = this.capitalizeFirstLetter(wrongProperty);
      if (error.kind === "required") {
        const errorMessage = `${formattedWrongProperty} is required.`;
        return errorMessage;
      }

      if (error.kind === "minlength") {
        const errorMessage = `${formattedWrongProperty} is too short.`;
        return errorMessage;
      }

      if(error.kind === "min") {
        const errorMessage = `${formattedWrongProperty} is too small.`;
        return errorMessage;
      }

      return error.properties.message;
    }
  }

  getFirstProperty(obj) {
    for (const property in obj) {
      return property;
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  isDuplicateError() {
    return this.error.code === 11000;
  }
};