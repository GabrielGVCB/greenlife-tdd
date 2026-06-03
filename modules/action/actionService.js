import Action from './actionModel.js';
import Category from '../category/categoryModel.js';
import Tip from '../tip/tipModel.js';
import { fn, col } from 'sequelize';

async function create(data) {
	const { title, description, impactKgCO2, userId, tipId, categoryId } = data;

	if (!title || title.trim().length < 3) {
		return { ok: false, error: 'Título da ação é obrigatório.' };
	}
	if (!userId) return { ok: false, error: 'Usuário é obrigatório.' };

	const action = await Action.create({
		title: title.trim(),
		description: description || null,
		impactKgCO2: parseFloat(impactKgCO2) || 0,
		userId,
		tipId: tipId || null,
		categoryId: categoryId || null
	});
	return { ok: true, action };
}

async function listByUser(userId) {
	return Action.findAll({
		where: { userId },
		include: [
			{ model: Category, as: 'category' },
			{ model: Tip, as: 'tip' }
		],
		order: [['createdAt', 'DESC']]
	});
}

async function totalImpactByUser(userId) {
	const result = await Action.sum('impactKgCO2', { where: { userId } });
	return result || 0;
}

async function countByUser(userId) {
	return Action.count({ where: { userId } });
}

async function remove(id, userId) {
	const a = await Action.findByPk(id);
	if (!a) return { ok: false, error: 'Ação não encontrada.' };
	if (a.userId !== userId) return { ok: false, error: 'Sem permissão.' };
	await a.destroy();
	return { ok: true };
}

export { create, listByUser, totalImpactByUser, countByUser, remove };
