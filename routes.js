
const express = require('express');
const router = express.Router();

const indexRouter = require('./routes/index');
const setsRouter = require('./routes/sets');
const refreshRouter = require('./routes/refresh');
const authRouter = require('./routes/auth');
const resetRouter = require('./routes/reset');

router.use('/', indexRouter);
router.use('/auth', authRouter);
router.use('/sets', setsRouter);
router.use('/reset', resetRouter)
router.use('/refresh', refreshRouter);

module.exports = router;
