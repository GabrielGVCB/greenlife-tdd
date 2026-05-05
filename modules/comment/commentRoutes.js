const express = require('express');
const router = express.Router();
const controller = require('./commentController');
const auth = require('../../middlewares/auth');

router.post('/post/:postId/comment', auth, controller.create);
router.post('/comment/:id/delete', auth, controller.delete);

module.exports = router;
