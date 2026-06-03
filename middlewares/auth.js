export default (req, res, next) => {
	if (req.session && req.session.user) {
		return next();
	}
	req.flash('error', 'Você precisa estar logado para acessar esta página.');
	res.redirect('/login');
};
