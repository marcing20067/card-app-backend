const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORDS,
  },
});

exports.sendMail = transporter.sendMail.bind(transporter);
