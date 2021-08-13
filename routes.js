const indexRouter = require('./routes/index.js');
const loginRouter = require('./routes/login.js');
const signupRouter = require('./routes/signup.js');
const setsRouter = require('./routes/sets.js');
const refreshRouter = require('./routes/refresh.js');
const express = require('express');
const router = express.Router();

router.use('/', indexRouter);
router.use('/signup', signupRouter);
router.use('/login', loginRouter);
router.use('/sets', setsRouter);
router.use('/refresh', refreshRouter);

module.exports = router;
