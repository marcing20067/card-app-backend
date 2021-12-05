const express = require('express');;
const router = express.Router();
const RefreshController = require('../controllers/refresh');

router.post('/', RefreshController.refresh);

module.exports = router;
