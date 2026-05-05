const multer = require('multer');
const path = require('path');

/**
 * Factory de upload de imagens.
 * Cobre os riscos:
 *  - R-02: Upload aceitando .exe (filtra por mimetype + extensão)
 *  - R-10: Erro silencioso em arquivo gigante (limite explícito + erro JSON legível)
 *
 * Regra de negócio (Particionamento + Valor-Limite):
 *  - Formato válido: image/jpeg, image/png, image/gif, image/webp
 *  - Tamanho: até 4MB (RN-003)
 *
 * @param {string} subfolder - subpasta dentro de public/uploads (ex: 'profiles', 'tips', 'posts')
 * @param {string} filenamePrefix - prefixo do arquivo gerado (ex: 'profile', 'tip')
 */
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

	// Filtro de tipos aceitos (apenas imagens reais)
	const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
	const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

	const fileFilter = (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();
		const mimeOk = ALLOWED_MIMETYPES.includes(file.mimetype);
		const extOk = ALLOWED_EXTENSIONS.includes(ext);

		if (mimeOk && extOk) {
			return cb(null, true);
		}
		// Erro descritivo (não silencioso) — cobre R-10
		const err = new Error('Tipo de arquivo não suportado. Envie JPG, PNG, GIF ou WEBP.');
		err.code = 'INVALID_FILE_TYPE';
		err.status = 400;
		cb(err, false);
	};

	return multer({
		storage,
		fileFilter,
		limits: { fileSize: 4 * 1024 * 1024 } // 4MB - RN-003
	});
}

// Instâncias prontas para uso
const profileUpload = createImageUpload('profiles', 'profile');
const tipUpload = createImageUpload('tips', 'tip');
const postUpload = createImageUpload('posts', 'post');

module.exports = {
	createImageUpload,
	profileUpload,
	tipUpload,
	postUpload
};
