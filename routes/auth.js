const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const isAuth = require('../middlewares/is-auth');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login)
router.get('/activate/:token', AuthController.activate);
router.get('/status', isAuth, AuthController.getStatus);

module.exports = router;
