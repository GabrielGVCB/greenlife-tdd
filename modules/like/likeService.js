import Like from './likeModel.js';

/**
 * Toggle de like em um post.
 *
 * Cobre Risco R-05 (race condition / curtida duplicada):
 *  - O modelo Like tem UNIQUE constraint em (userId, postId)
 *  - Se 10 requests chegam em paralelo, o BD aceita apenas 1 INSERT;
 *    os outros caem no catch (SequelizeUniqueConstraintError)
 *  - Resultado: contagem final sempre = 0 ou 1, nunca acima
 *
 * @returns {Promise<{ ok: boolean, liked: boolean, totalLikes: number }>}
 */
async function toggle(userId, postId) {
	if (!userId || !postId) {
		return { ok: false, error: 'Dados incompletos.' };
	}

	const existing = await Like.findOne({ where: { userId, postId } });

	if (existing) {
		// Já curtiu → remove (unlike)
		await existing.destroy();
		const total = await Like.count({ where: { postId } });
		return { ok: true, liked: false, totalLikes: total };
	}

	// Tenta criar — se cair no UNIQUE (race), trata silenciosamente
	try {
		await Like.create({ userId, postId });
	} catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			// Outro request paralelo já criou — está tudo certo, apenas não dobrar
		} else {
			throw err;
		}
	}

	const total = await Like.count({ where: { postId } });
	return { ok: true, liked: true, totalLikes: total };
}

async function countByPost(postId) {
	return Like.count({ where: { postId } });
}

async function userHasLiked(userId, postId) {
	const like = await Like.findOne({ where: { userId, postId } });
	return !!like;
}

export { toggle, countByPost, userHasLiked };
