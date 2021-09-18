const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const setsRouter = require('./routes/sets');
const refreshRouter = require('./routes/refresh');
const resetPasswordRouter = require('./routes/resetPassword');
const express = require('express');
const router = express.Router();
const activateRouter = require('./routes/activate');

router.use('/', indexRouter);
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/activate', activateRouter)
router.use('/sets', setsRouter);
router.use('/refresh', refreshRouter);
router.use('/resetPassword', resetPasswordRouter);
module.exports = router;
