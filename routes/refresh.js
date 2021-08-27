const express = require('express');;
const router = express.Router();
const checkTokenAndSetUserData = require('../middlewares/token.js')
const RefreshController = require('../controllers/refresh.js');

router.get('/', checkTokenAndSetUserData, RefreshController.refresh);

module.exports = router;
