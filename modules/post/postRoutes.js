const express = require('express');
const router = express.Router();
const controller = require('./postController');
const auth = require('../../middlewares/auth');
const { postUpload } = require('../../middlewares/multer');
const uploadErrorHandler = require('../../middlewares/uploadErrorHandler');

router.get('/community', controller.community);
router.get('/post/new', auth, controller.showNew);
router.post(
	'/post/new',
	auth,
	postUpload.single('image'),
	uploadErrorHandler,
	controller.create
);
router.get('/post/:id', controller.show);
router.post('/post/:id/delete', auth, controller.delete);

module.exports = router;
