require('dotenv').config({
    path: 'env/.env'
});
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./routes');
const cors = require('cors');
const connectDB = require('./db');
const app = express();
const error = require('./middlewares/error');
connectDB()
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: ['http://localhost:4200', 'https://card-app-backend.netlify.app'],
}))


app.use(routes)

app.use(error)

module.exports = app;
