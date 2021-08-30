const express = require('express');;
const router = express.Router();
const checkTokenAndSetUserData = require('../middlewares/token')
const RefreshController = require('../controllers/refresh');

router.get('/', checkTokenAndSetUserData, RefreshController.refresh);

module.exports = router;
