const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/is-auth');
const SetsController = require('../controllers/sets');

router.get('/', isAuth, SetsController.getSets);
router.get('/:setId', isAuth, SetsController.getSet);
router.delete('/:setId', isAuth, SetsController.deleteSet);
router.put('/:setId', isAuth, SetsController.updateSet)
router.post('', isAuth, SetsController.addSet)

module.exports = router;
