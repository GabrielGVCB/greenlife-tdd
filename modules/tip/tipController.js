const tipService = require('./tipService');
const categoryService = require('../category/categoryService');

/**
 * GET /tip/:id - detalhe de uma dica
 */
exports.show = async (req, res) => {
	try {
		const tip = await tipService.findById(req.params.id);
		if (!tip) {
			return res.status(404).render('error', {
				message: 'Dica não encontrada',
				error: { status: 404, stack: '' }
			});
		}
		res.render('tip-detail', {
			title: `${tip.title} - Green Life`,
			tip
		});
	} catch (err) {
		console.error('[tip.show] erro:', err);
		req.flash('error', 'Erro ao carregar dica.');
		res.redirect('/home');
	}
};

// === ADMIN ===

exports.adminList = async (req, res) => {
	const tips = await tipService.listAll();
	res.render('admin/tips', {
		title: 'Gerenciar dicas - Admin',
		tips
	});
};

exports.adminNew = async (req, res) => {
	const categories = await categoryService.listAll();
	res.render('admin/tip-form', {
		title: 'Nova dica - Admin',
		categories,
		tip: null
	});
};

exports.adminCreate = async (req, res) => {
	try {
		const data = {
			...req.body,
			authorId: req.session.user.id,
			image: req.file ? req.file.filename : null
		};
		const result = await tipService.create(data);
		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/admin/tips/new');
		}
		req.flash('success', 'Dica criada com sucesso!');
		res.redirect('/admin/tips');
	} catch (err) {
		console.error('[adminCreate tip] erro:', err);
		req.flash('error', 'Erro ao criar dica.');
		res.redirect('/admin/tips/new');
	}
};

exports.adminEdit = async (req, res) => {
	const tip = await tipService.findById(req.params.id);
	const categories = await categoryService.listAll();
	if (!tip) return res.redirect('/admin/tips');
	res.render('admin/tip-form', {
		title: 'Editar dica - Admin',
		tip,
		categories
	});
};

exports.adminUpdate = async (req, res) => {
	try {
		const data = { ...req.body };
		if (req.file) data.image = req.file.filename;
		const result = await tipService.update(req.params.id, data);
		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect(`/admin/tips/${req.params.id}/edit`);
		}
		req.flash('success', 'Dica atualizada!');
		res.redirect('/admin/tips');
	} catch (err) {
		console.error('[adminUpdate tip] erro:', err);
		req.flash('error', 'Erro ao atualizar dica.');
		res.redirect('/admin/tips');
	}
};

exports.adminDelete = async (req, res) => {
	const result = await tipService.remove(req.params.id);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Dica removida.');
	res.redirect('/admin/tips');
};
