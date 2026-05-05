const Comment = require('./commentModel');
const Post = require('../post/postModel');

/**
 * Cria um comentário em um post.
 *
 * Cobre Risco R-07 (XSS):
 *  - O texto é salvo "as-is" no banco (preserva o input do usuário)
 *  - A defesa principal é o template EJS usar <%= %> (escape automático)
 *  - Nunca usar <%- %> para renderizar texto livre do usuário
 *
 * @param {Object} data - { text, userId, postId }
 */
async function create(data) {
	const { text, userId, postId } = data;

	if (!text || typeof text !== 'string' || text.trim().length === 0) {
		return { ok: false, error: 'Comentário não pode ser vazio.' };
	}
	if (text.trim().length > 500) {
		return { ok: false, error: 'Comentário muito longo (máx. 500 caracteres).' };
	}
	if (!userId) return { ok: false, error: 'Você precisa estar logado.' };
	if (!postId) return { ok: false, error: 'Post não informado.' };

	// Confirma que o post existe
	const post = await Post.findByPk(postId);
	if (!post) return { ok: false, error: 'Post não encontrado.' };

	const comment = await Comment.create({
		text: text.trim(),
		userId,
		postId
	});
	return { ok: true, comment };
}

async function remove(id, userId, isAdmin = false) {
	const comment = await Comment.findByPk(id);
	if (!comment) return { ok: false, error: 'Comentário não encontrado.' };
	if (comment.userId !== userId && !isAdmin) {
		return { ok: false, error: 'Sem permissão.' };
	}
	await comment.destroy();
	return { ok: true };
}

module.exports = {
	create,
	remove
};
