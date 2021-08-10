const express = require('express');
const router = express.Router();

const SignupController = require('../controllers/signup.js');

router.post('/', SignupController.signup);

module.exports = router;
