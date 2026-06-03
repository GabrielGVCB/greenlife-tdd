import express from 'express';
import * as controller from './likeController.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.post('/post/:postId/like', auth, controller.toggle);

export default router;
