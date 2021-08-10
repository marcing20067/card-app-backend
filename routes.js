const indexRouter = require('./routes/index.js');
const loginRouter = require('./routes/login.js');
const signupRouter = require('./routes/signup.js');
const setsRouter = require('./routes/sets.js');
const refreshRouter = require('./routes/refresh.js');


const setAppRoutes = (app) => {
    app.use('/', indexRouter);
    app.use('/signup', signupRouter);
    app.use('/login', loginRouter);
    app.use('/sets', setsRouter);
    app.use('/refresh', refreshRouter);
}

module.exports = setAppRoutes;
