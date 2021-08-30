const express = require('express');
const router = express.Router();

const checkTokenAndSetUserData = require('../middlewares/token');
const SetsController = require('../controllers/sets');

router.get('/', checkTokenAndSetUserData, SetsController.getSets);
router.get('/:setId', checkTokenAndSetUserData, SetsController.getSet);
router.delete('/:setId', checkTokenAndSetUserData, SetsController.deleteSet);
router.put('/:setId', checkTokenAndSetUserData, SetsController.updateSet)
router.post('', checkTokenAndSetUserData, SetsController.addSet)

module.exports = router;
