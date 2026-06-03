import Favorite from './favoriteModel.js';
import Tip from '../tip/tipModel.js';
import Category from '../category/categoryModel.js';

/**
 * Toggle favorito (mesma lógica anti-duplicata que Like → R-05).
 */
async function toggle(userId, tipId) {
	if (!userId || !tipId) return { ok: false, error: 'Dados incompletos.' };

	const existing = await Favorite.findOne({ where: { userId, tipId } });
	if (existing) {
		await existing.destroy();
		return { ok: true, favorited: false };
	}

	try {
		await Favorite.create({ userId, tipId });
	} catch (err) {
		if (err.name !== 'SequelizeUniqueConstraintError') throw err;
	}
	return { ok: true, favorited: true };
}

async function listByUser(userId) {
	return Favorite.findAll({
		where: { userId },
		include: [
			{
				model: Tip,
				include: [{ model: Category, as: 'category' }]
			}
		],
		order: [['createdAt', 'DESC']]
	});
}

async function isFavorited(userId, tipId) {
	if (!userId) return false;
	const f = await Favorite.findOne({ where: { userId, tipId } });
	return !!f;
}

export { toggle, listByUser, isFavorited };
