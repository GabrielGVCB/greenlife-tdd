const favoriteService = require('./favoriteService');
const tipService = require('../tip/tipService');

exports.list = async (req, res) => {
	try {
		const favorites = await favoriteService.listByUser(req.session.user.id);
		res.render('favorites', {
			title: 'Meus favoritos - Green Life',
			favorites
		});
	} catch (err) {
		console.error('[favorites.list] erro:', err);
		req.flash('error', 'Erro ao carregar favoritos.');
		res.redirect('/home');
	}
};

exports.toggle = async (req, res) => {
	try {
		const result = await favoriteService.toggle(req.session.user.id, req.params.tipId);
		if (req.accepts('json') && !req.accepts('html')) {
			return res.json(result);
		}
		res.redirect(req.get('referer') || '/favorites');
	} catch (err) {
		console.error('[favorites.toggle] erro:', err);
		req.flash('error', 'Erro ao favoritar.');
		res.redirect(req.get('referer') || '/home');
	}
};
