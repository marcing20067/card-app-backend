const express = require('express');;
const router = express.Router();
const ActivateController = require('../controllers/activate');

router.get('/:activationToken', ActivateController.activate);

module.exports = router;