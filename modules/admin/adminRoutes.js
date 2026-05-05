const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const categoryController = require('../category/categoryController');
const tipController = require('../tip/tipController');
const postController = require('../post/postController');
const adminAuth = require('../../middlewares/adminAuth');
const { tipUpload } = require('../../middlewares/multer');
const uploadErrorHandler = require('../../middlewares/uploadErrorHandler');

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
router.post('/posts/:id/delete', postController.delete);

module.exports = router;
