const express = require('express');
const router = express.Router();
const csrfToken = require('../middlewares/csrf');
const isAuth = require('../middlewares/is-auth');
const SetsController = require('../controllers/sets');

router.get('/', isAuth, csrfToken, SetsController.getSets);
router.get('/:setId', isAuth, csrfToken, SetsController.getSet);
router.delete('/:setId', isAuth, csrfToken, SetsController.deleteSet);
router.put('/:setId', isAuth, csrfToken, SetsController.updateSet)
router.post('', isAuth, csrfToken, SetsController.addSet)

module.exports = router;
