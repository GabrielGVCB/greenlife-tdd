const express = require('express');
const router = express.Router();
const controller = require('./likeController');
const auth = require('../../middlewares/auth');

router.post('/post/:postId/like', auth, controller.toggle);

module.exports = router;
