const express = require('express');
const router = express.Router();
const controller = require('./userController');
const auth = require('../../middlewares/auth');
const { profileUpload } = require('../../middlewares/multer');
const uploadErrorHandler = require('../../middlewares/uploadErrorHandler');

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

module.exports = router;
