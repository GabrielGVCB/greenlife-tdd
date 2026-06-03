import express from 'express';
import * as controller from './commentController.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.post('/post/:postId/comment', auth, controller.create);
router.post('/comment/:id/delete', auth, controller.deleteComment);

export default router;
