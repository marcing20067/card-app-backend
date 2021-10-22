const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const config = require('../config/config');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: config.SENDGRID_API_KEY
    }
}))

module.exports = transporter;