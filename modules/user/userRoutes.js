import express from 'express';
import * as controller from './userController.js';
import auth from '../../middlewares/auth.js';
import { profileUpload } from '../../middlewares/multer.js';
import uploadErrorHandler from '../../middlewares/uploadErrorHandler.js';

const router = express.Router();

// Autenticação
router.get('/login', controller.showLogin);
router.post('/login', controller.login);

router.get('/register', controller.showRegister);
router.post('/register', controller.register);

router.get('/logout', controller.logout);

// Perfil
router.get('/profile/edit', auth, controller.showEditProfile);
router.post(
	'/profile/edit',
	auth,
	profileUpload.single('profilePicture'),
	uploadErrorHandler,
	controller.updateProfile
);

export default router;
