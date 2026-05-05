const express = require('express');
const router = express.Router();
const controller = require('./favoriteController');
const auth = require('../../middlewares/auth');

router.get('/favorites', auth, controller.list);
router.post('/tip/:tipId/favorite', auth, controller.toggle);

module.exports = router;
