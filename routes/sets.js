const express = require('express');
const router = express.Router();

const Token = require('../middlewares/token.js')
const SetsController = require('../controllers/sets.js');

router.get('/', Token, SetsController.getSets);
router.get('/:setId', Token, SetsController.getSet);
router.delete('/:setId', Token, SetsController.deleteSet);
router.put('/:setId', Token, SetsController.updateSet)
router.post('', Token, SetsController.addSet)

module.exports = router;
