import multer from 'multer';
import path from 'path';

function createImageUpload(subfolder, filenamePrefix) {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, `public/uploads/${subfolder}/`);
		},
		filename: (req, file, cb) => {
			const userId = req.session && req.session.user ? req.session.user.id : 'anon';
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			cb(
				null,
				`${filenamePrefix}-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`
			);
		}
	});

	const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

	const fileFilter = (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);
		const extOk = ALLOWED_EXTENSIONS.includes(ext);

		if (mimeOk && extOk) {
			return cb(null, true);
		}
		const err = new Error('Tipo de arquivo não suportado. Envie JPG, PNG, GIF ou WEBP.');
		err.code = 'INVALID_FILE_TYPE';
		err.status = 400;
		cb(err, false);
	};

	return multer({
		storage,
		fileFilter,
		limits: { fileSize: 4 * 1024 * 1024 }
	});
}

export const profileUpload = createImageUpload('profiles', 'profile');
export const tipUpload = createImageUpload('tips', 'tip');
export const postUpload = createImageUpload('posts', 'post');
export { createImageUpload };
