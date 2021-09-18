
const express = require('express');;
const router = express.Router();
const activateController = require('../controllers/activate');

router.get('/:activationToken', activateController.activate);

module.exports = router;