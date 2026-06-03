import express from 'express';
import * as controller from './favoriteController.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.get('/favorites', auth, controller.list);
router.post('/tip/:tipId/favorite', auth, controller.toggle);

export default router;
