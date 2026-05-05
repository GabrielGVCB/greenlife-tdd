const commentService = require('./commentService');

exports.create = async (req, res) => {
	try {
		const result = await commentService.create({
			text: req.body.text,
			userId: req.session.user.id,
			postId: req.params.postId
		});
		if (!result.ok) {
			req.flash('error', result.error);
		} else {
			req.flash('success', 'Comentário publicado.');
		}
		res.redirect(`/post/${req.params.postId}`);
	} catch (err) {
		console.error('[comment.create] erro:', err);
		req.flash('error', 'Erro ao comentar.');
		res.redirect(`/post/${req.params.postId}`);
	}
};

exports.delete = async (req, res) => {
	const isAdmin = req.session.user.role === 'admin';
	const result = await commentService.remove(req.params.id, req.session.user.id, isAdmin);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Comentário removido.');
	res.redirect(req.get('referer') || '/community');
};
