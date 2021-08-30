const mongoose = require('mongoose');
const config = require('./config/config');

module.exports = () => {
    mongoose.connect(`mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}${config.DB_HOST}/${config.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
}