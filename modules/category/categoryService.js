import Category from './categoryModel.js';

/**
 * Gera slug a partir do nome (ex: "Energia em Casa" → "energia-em-casa")
 */
function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
}

async function listAll() {
	return Category.findAll({ order: [['name', 'ASC']] });
}

async function findBySlug(slug) {
	return Category.findOne({ where: { slug } });
}

async function findById(id) {
	return Category.findByPk(id);
}

async function create(data) {
	const { name, description, icon, color } = data;
	if (!name || name.trim().length < 2) {
		return { ok: false, error: 'Nome da categoria é obrigatório.' };
	}
	const slug = slugify(name);
	const exists = await Category.findOne({ where: { slug } });
	if (exists) return { ok: false, error: 'Categoria já existe.' };

	const cat = await Category.create({
		name: name.trim(),
		slug,
		description,
		icon: icon || 'bi-leaf',
		color: color || '#3E6B4A'
	});
	return { ok: true, category: cat };
}

async function update(id, data) {
	const cat = await Category.findByPk(id);
	if (!cat) return { ok: false, error: 'Categoria não encontrada.' };

	const { name, description, icon, color } = data;
	if (name) {
		cat.name = name.trim();
		cat.slug = slugify(name);
	}
	if (description !== undefined) cat.description = description;
	if (icon !== undefined) cat.icon = icon;
	if (color !== undefined) cat.color = color;

	await cat.save();
	return { ok: true, category: cat };
}

async function remove(id) {
	const cat = await Category.findByPk(id);
	if (!cat) return { ok: false, error: 'Categoria não encontrada.' };
	await cat.destroy();
	return { ok: true };
}

export { slugify, listAll, findBySlug, findById, create, update, remove };
