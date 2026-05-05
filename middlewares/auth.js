/**
 * Middleware: garante que há um usuário logado na sessão.
 * Caso contrário, redireciona para /login com mensagem flash.
 *
 * Cobre Risco R-06 (rotas privadas expostas).
 */
module.exports = (req, res, next) => {
	if (req.session && req.session.user) {
		return next();
	}
	req.flash('error', 'Você precisa estar logado para acessar esta página.');
	res.redirect('/login');
};
