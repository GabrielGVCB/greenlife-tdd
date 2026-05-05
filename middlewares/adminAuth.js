/**
 * Middleware: garante que há um usuário logado E que ele tem role "admin".
 * Implementa a Tabela de Decisão da seção 5.4 do plano de testes.
 *
 * Cobre Risco R-06 (rota admin exposta).
 *
 * Tabela de Decisão:
 *  - Logado + admin   → permite (next)
 *  - Logado + !admin  → 403 Forbidden
 *  - !Logado          → 401 / redirect para /login
 */
module.exports = (req, res, next) => {
	// Não autenticado
	if (!req.session || !req.session.user) {
		req.flash('error', 'Você precisa estar logado para acessar esta página.');
		return res.status(401).redirect('/login');
	}

	// Autenticado mas sem permissão
	if (req.session.user.role !== 'admin') {
		req.flash('error', 'Acesso negado. Esta área é restrita a administradores.');
		return res.status(403).render('error', {
			message: 'Acesso negado',
			error: { status: 403, stack: '' }
		});
	}

	// Autorizado
	return next();
};
