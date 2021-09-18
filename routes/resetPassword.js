const express = require('express');
const router = express.Router();

const ResetPasswordControllers = require('../controllers/resetPassword');

router.post('/', ResetPasswordControllers.resetPassword);
router.post('/:resetPasswordToken', ResetPasswordControllers.resetPasswordWithToken)
module.exports = router;
