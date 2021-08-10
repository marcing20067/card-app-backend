const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('./config/config.js');
const setAppRoutes = require('./routes.js');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

mongoose.connect(`mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}${config.DB_HOST}/${config.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: 'http://localhost:4200',
}))

setAppRoutes(app);

module.exports = app;
