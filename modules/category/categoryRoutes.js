import express from 'express';
import * as controller from './categoryController.js';

const router = express.Router();

// Públicas
router.get('/home', controller.showHome);
router.get('/category/:slug', controller.showCategory);

export default router;
