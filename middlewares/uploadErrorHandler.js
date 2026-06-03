import multer from 'multer';

export default (err, req, res, next) => {
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
		if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
			return res.status(413).json({ error: mensagem, code: err.code });
		}
		return res.redirect(req.get('referer') || '/');
	}

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
