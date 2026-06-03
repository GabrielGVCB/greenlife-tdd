import express from 'express';
import * as controller from './tipController.js';

const router = express.Router();

router.get('/tip/:id', controller.show);

export default router;
