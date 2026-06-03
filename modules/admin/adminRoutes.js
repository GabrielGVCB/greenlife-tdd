import express from 'express';
import * as adminController from './adminController.js';
import * as categoryController from '../category/categoryController.js';
import * as tipController from '../tip/tipController.js';
import * as postController from '../post/postController.js';
import adminAuth from '../../middlewares/adminAuth.js';
import { tipUpload } from '../../middlewares/multer.js';
import uploadErrorHandler from '../../middlewares/uploadErrorHandler.js';

const router = express.Router();

// ===== Proteção global para TUDO que começa com /admin =====
// (Cobre Risco R-06: rota admin exposta)
router.use(adminAuth);

// Dashboard
router.get('/', adminController.dashboard);
router.get('/dashboard', adminController.dashboard);

// Usuários
router.get('/users', adminController.users);
router.post('/users/:id/toggle-role', adminController.toggleRole);
router.post('/users/:id/delete', adminController.deleteUser);

// Categorias
router.get('/categories', categoryController.adminList);
router.post('/categories', categoryController.adminCreate);
router.post('/categories/:id/update', categoryController.adminUpdate);
router.post('/categories/:id/delete', categoryController.adminDelete);

// Dicas
router.get('/tips', tipController.adminList);
router.get('/tips/new', tipController.adminNew);
router.post(
	'/tips/new',
	tipUpload.single('image'),
	uploadErrorHandler,
	tipController.adminCreate
);
router.get('/tips/:id/edit', tipController.adminEdit);
router.post(
	'/tips/:id/edit',
	tipUpload.single('image'),
	uploadErrorHandler,
	tipController.adminUpdate
);
router.post('/tips/:id/delete', tipController.adminDelete);

// Posts (moderação)
router.get('/posts', adminController.posts);
router.post('/posts/:id/delete', postController.deletePost);

export default router;
