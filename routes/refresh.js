const express = require('express');;
const router = express.Router();
const isAuth = require('../middlewares/is-auth');
const RefreshController = require('../controllers/refresh');

router.get('/', isAuth, RefreshController.refresh);

module.exports = router;
