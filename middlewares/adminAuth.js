export default (req, res, next) => {
	if (!req.session || !req.session.user) {
		req.flash && req.flash('error', 'Você precisa estar logado para acessar esta página.');
		return res.status(401).redirect('/login');
	}

	if (req.session.user.role !== 'admin') {
		req.flash && req.flash('error', 'Acesso negado. Esta área é restrita a administradores.');
		return res.status(403).render('error', {
			message: 'Acesso negado',
			error: { status: 403, stack: '' }
		});
	}

	return next();
};
