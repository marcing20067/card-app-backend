const express = require('express');
const router = express.Router();

const ResetUsernameControllers = require('../controllers/resetUsername');

router.post('/', ResetUsernameControllers.resetUsername);
router.post('/:resetUsernameToken', ResetUsernameControllers.resetUsernameWithToken)
module.exports = router;
