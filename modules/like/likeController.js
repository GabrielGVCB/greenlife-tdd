import * as likeService from './likeService.js';

/**
 * POST /post/:postId/like
 * Aceita JSON (para AJAX) ou form (redirect).
 */
export const toggle = async (req, res) => {
	try {
		const result = await likeService.toggle(req.session.user.id, req.params.postId);

		// Resposta JSON para front-end dinâmico
		if (req.accepts('json') && !req.accepts('html')) {
			return res.json(result);
		}

		// Resposta tradicional (form post)
		res.redirect(req.get('referer') || `/post/${req.params.postId}`);
	} catch (err) {
		console.error('[like.toggle] erro:', err);
		req.flash('error', 'Erro ao curtir post.');
		res.redirect(req.get('referer') || '/community');
	}
};
