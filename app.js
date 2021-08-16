const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./routes.js');
const cors = require('cors');
const connectDB = require('./db.js');
const app = express();

connectDB()
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: 'http://localhost:4200',
}))

app.use(routes)

module.exports = app;
