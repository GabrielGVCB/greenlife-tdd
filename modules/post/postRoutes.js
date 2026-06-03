import express from 'express';
import * as controller from './postController.js';
import auth from '../../middlewares/auth.js';
import { postUpload } from '../../middlewares/multer.js';
import uploadErrorHandler from '../../middlewares/uploadErrorHandler.js';

const router = express.Router();

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
router.post('/post/:id/delete', auth, controller.deletePost);

export default router;
