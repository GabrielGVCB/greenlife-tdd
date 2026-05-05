const multer = require('multer');

/**
 * Middleware: trata erros do multer e retorna JSON/flash legível.
 * Sempre fica logo após uma rota que usa upload.
 *
 * Cobre Risco R-10 (erro silencioso em arquivo gigante).
 */
module.exports = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		let mensagem;
		switch (err.code) {
			case 'LIMIT_FILE_SIZE':
				mensagem = 'Arquivo muito grande. O limite é 4MB.';
				break;
			case 'LIMIT_UNEXPECTED_FILE':
				mensagem = 'Campo de arquivo inesperado.';
				break;
			default:
				mensagem = `Erro no upload: ${err.message}`;
		}
		req.flash('error', mensagem);

		// Resposta JSON quando vier de API
		if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
			return res.status(413).json({ error: mensagem, code: err.code });
		}
		return res.redirect(req.get('referer') || '/');
	}

	// Erro custom do filtro de tipo
	if (err && err.code === 'INVALID_FILE_TYPE') {
		req.flash('error', err.message);
		if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
			return res.status(400).json({ error: err.message });
		}
		return res.redirect(req.get('referer') || '/');
	}

	if (err) return next(err);
	next();
};
