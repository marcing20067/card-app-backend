const express = require('express');;
const router = express.Router();

const RefreshController = require('../controllers/refresh.js');

router.get('/', RefreshController.refreshToken);

module.exports = router;
