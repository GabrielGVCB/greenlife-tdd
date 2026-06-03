import express from 'express';
import * as controller from './actionController.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();

router.get('/actions', auth, controller.list);
router.get('/actions/new', auth, controller.showNew);
router.post('/actions/new', auth, controller.create);
router.post('/actions/:id/delete', auth, controller.deleteAction);

export default router;
