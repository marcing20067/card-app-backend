const express = require('express');
const router = express.Router();

const ResetController = require('../controllers/reset');

router.post('/password', ResetController.resetPassword);
router.post('/password/:token', ResetController.resetPasswordWithToken);

router.post('/username', ResetController.resetUsername);
router.post('/username/:token', ResetController.resetUsernameWithToken);

module.exports = router;
