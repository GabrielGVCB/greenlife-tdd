import Tip from './tipModel.js';
import Category from '../category/categoryModel.js';
import User from '../user/userModel.js';
import { isValidContent } from '../../middlewares/validators.js';

async function listAll(opts = {}) {
	const { limit = 50, offset = 0 } = opts;
	return Tip.findAll({
		include: [
			{ model: Category, as: 'category' },
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }
		],
		order: [['createdAt', 'DESC']],
		limit,
		offset
	});
}

async function listByCategory(categoryId, opts = {}) {
	const { limit = 50 } = opts;
	return Tip.findAll({
		where: { categoryId },
		include: [
			{ model: Category, as: 'category' },
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }
		],
		order: [['createdAt', 'DESC']],
		limit
	});
}

async function findById(id) {
	return Tip.findByPk(id, {
		include: [
			{ model: Category, as: 'category' },
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }
		]
	});
}

/**
 * Cria nova dica.
 * Cobre R-08 (limite de tamanho do conteúdo) via isValidContent.
 */
async function create(data) {
	const { title, content, summary, image, categoryId, authorId, readTimeMinutes, impactKgCO2 } =
		data;

	if (!title || title.trim().length < 3) {
		return { ok: false, error: 'Título é obrigatório (mín. 3 caracteres).' };
	}
	const contentCheck = isValidContent(content);
	if (!contentCheck.valid) return { ok: false, error: contentCheck.message };

	if (!categoryId) return { ok: false, error: 'Categoria é obrigatória.' };
	if (!authorId) return { ok: false, error: 'Autor é obrigatório.' };

	const category = await Category.findByPk(categoryId);
	if (!category) return { ok: false, error: 'Categoria inválida.' };

	const tip = await Tip.create({
		title: title.trim(),
		content,
		summary,
		image,
		categoryId,
		authorId,
		readTimeMinutes: readTimeMinutes || 5,
		impactKgCO2: impactKgCO2 || 0
	});
	return { ok: true, tip };
}

async function update(id, data) {
	const tip = await Tip.findByPk(id);
	if (!tip) return { ok: false, error: 'Dica não encontrada.' };

	if (data.content !== undefined) {
		const contentCheck = isValidContent(data.content);
		if (!contentCheck.valid) return { ok: false, error: contentCheck.message };
		tip.content = data.content;
	}
	if (data.title !== undefined) tip.title = data.title.trim();
	if (data.summary !== undefined) tip.summary = data.summary;
	if (data.image !== undefined) tip.image = data.image;
	if (data.categoryId !== undefined) tip.categoryId = data.categoryId;
	if (data.readTimeMinutes !== undefined) tip.readTimeMinutes = data.readTimeMinutes;
	if (data.impactKgCO2 !== undefined) tip.impactKgCO2 = data.impactKgCO2;

	await tip.save();
	return { ok: true, tip };
}

async function remove(id) {
	const tip = await Tip.findByPk(id);
	if (!tip) return { ok: false, error: 'Dica não encontrada.' };
	await tip.destroy();
	return { ok: true };
}

async function count() {
	return Tip.count();
}

export { listAll, listByCategory, findById, create, update, remove, count };
