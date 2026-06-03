import * as actionService from './actionService.js';
import * as categoryService from '../category/categoryService.js';
import * as tipService from '../tip/tipService.js';

export const list = async (req, res) => {
	try {
		const userId = req.session.user.id;
		const actions = await actionService.listByUser(userId);
		const totalImpact = await actionService.totalImpactByUser(userId);
		const count = await actionService.countByUser(userId);

		res.render('actions', {
			title: 'Minhas ações - Green Life',
			actions,
			totalImpact: Number(totalImpact).toFixed(2),
			count
		});
	} catch (err) {
		console.error('[actions.list] erro:', err);
		req.flash('error', 'Erro ao carregar ações.');
		res.redirect('/home');
	}
};

export const showNew = async (req, res) => {
	const categories = await categoryService.listAll();
	const tips = await tipService.listAll({ limit: 100 });
	res.render('action-form', {
		title: 'Registrar ação - Green Life',
		categories,
		tips
	});
};

export const create = async (req, res) => {
	try {
		const data = { ...req.body, userId: req.session.user.id };
		const result = await actionService.create(data);
		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/actions/new');
		}
		req.flash('success', 'Ação registrada! Obrigado por cuidar do planeta 🌱');
		res.redirect('/actions');
	} catch (err) {
		console.error('[actions.create] erro:', err);
		req.flash('error', 'Erro ao registrar ação.');
		res.redirect('/actions/new');
	}
};

export const deleteAction = async (req, res) => {
	const result = await actionService.remove(req.params.id, req.session.user.id);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Ação removida.');
	res.redirect('/actions');
};
