const { Op } = require('sequelize');
const Post = require('./postModel');
const User = require('../user/userModel');
const Category = require('../category/categoryModel');
const Like = require('../like/likeModel');
const { isValidContent } = require('../../middlewares/validators');

/**
 * Lista posts visíveis para um determinado viewer.
 *
 * Cobre Risco R-12 (privacidade):
 *  - Posts privados só aparecem para o próprio autor
 *
 * Cobre Risco R-09 (fallback do feed):
 *  - Se viewerId vier null (visitante), só lista posts públicos
 *  - Nunca retorna lista vazia silenciosa: caller deve mostrar fallback
 *
 * Tabela de Decisão (seção 5.6):
 *   isPrivate=N, viewer=qualquer  → exibe
 *   isPrivate=S, viewer=dono      → exibe
 *   isPrivate=S, viewer!=dono     → oculta
 */
async function listVisible(opts = {}) {
	const { viewerId = null, limit = 50, offset = 0 } = opts;

	const where = {
		[Op.or]: [
			{ isPrivate: false },
			...(viewerId ? [{ isPrivate: true, userId: viewerId }] : [])
		]
	};

	return Post.findAll({
		where,
		include: [
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'profilePicture'] },
			{ model: Category, as: 'category' }
		],
		order: [['createdAt', 'DESC']],
		limit,
		offset
	});
}

async function listByCategory(categoryId, opts = {}) {
	const { viewerId = null, limit = 50 } = opts;
	const where = {
		categoryId,
		[Op.or]: [
			{ isPrivate: false },
			...(viewerId ? [{ isPrivate: true, userId: viewerId }] : [])
		]
	};
	return Post.findAll({
		where,
		include: [
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'profilePicture'] }
		],
		order: [['createdAt', 'DESC']],
		limit
	});
}

async function findVisibleById(id, viewerId = null) {
	const post = await Post.findByPk(id, {
		include: [
			{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'profilePicture'] },
			{ model: Category, as: 'category' }
		]
	});
	if (!post) return null;

	// R-12: privado só para o dono
	if (post.isPrivate && post.userId !== viewerId) {
		return null;
	}
	return post;
}

async function create(data) {
	const { title, content, image, categoryId, userId, isPrivate } = data;

	if (!title || title.trim().length < 3) {
		return { ok: false, error: 'Título obrigatório (mín. 3 caracteres).' };
	}
	const contentCheck = isValidContent(content);
	if (!contentCheck.valid) return { ok: false, error: contentCheck.message };
	if (!userId) return { ok: false, error: 'Autor é obrigatório.' };

	const post = await Post.create({
		title: title.trim(),
		content,
		image,
		categoryId: categoryId || null,
		userId,
		isPrivate: isPrivate === true || isPrivate === 'true' || isPrivate === 'on'
	});
	return { ok: true, post };
}

async function update(id, userId, data) {
	const post = await Post.findByPk(id);
	if (!post) return { ok: false, error: 'Post não encontrado.' };
	if (post.userId !== userId) return { ok: false, error: 'Sem permissão.' };

	if (data.content !== undefined) {
		const contentCheck = isValidContent(data.content);
		if (!contentCheck.valid) return { ok: false, error: contentCheck.message };
		post.content = data.content;
	}
	if (data.title !== undefined) post.title = data.title.trim();
	if (data.image !== undefined) post.image = data.image;
	if (data.categoryId !== undefined) post.categoryId = data.categoryId || null;
	if (data.isPrivate !== undefined) {
		post.isPrivate = data.isPrivate === true || data.isPrivate === 'true' || data.isPrivate === 'on';
	}

	await post.save();
	return { ok: true, post };
}

async function remove(id, userId, isAdmin = false) {
	const post = await Post.findByPk(id);
	if (!post) return { ok: false, error: 'Post não encontrado.' };
	if (post.userId !== userId && !isAdmin) {
		return { ok: false, error: 'Sem permissão.' };
	}
	await post.destroy();
	return { ok: true };
}

/**
 * Conta likes de um post (com cache simples por consulta).
 */
async function countLikes(postId) {
	return Like.count({ where: { postId } });
}

async function count() {
	return Post.count();
}

module.exports = {
	listVisible,
	listByCategory,
	findVisibleById,
	create,
	update,
	remove,
	countLikes,
	count
};
