const postService = require('./postService');
const tipService = require('../tip/tipService');
const categoryService = require('../category/categoryService');
const Comment = require('../comment/commentModel');
const User = require('../user/userModel');

/**
 * GET /community → feed da comunidade.
 *
 * Cobre R-09 (fallback): se não houver posts visíveis, mostra dicas oficiais
 * em vez de tela vazia.
 */
exports.community = async (req, res) => {
	try {
		const viewerId = req.session.user ? req.session.user.id : null;
		const posts = await postService.listVisible({ viewerId, limit: 30 });

		// Anexa contagem de likes a cada post
		const postsWithLikes = await Promise.all(
			posts.map(async (p) => {
				const likes = await postService.countLikes(p.id);
				return { ...p.toJSON(), likes };
			})
		);

		// Fallback (R-09): se vazio, oferece dicas
		let fallbackTips = [];
		if (postsWithLikes.length === 0) {
			fallbackTips = await tipService.listAll({ limit: 6 });
		}

		res.render('community', {
			title: 'Comunidade - Green Life',
			posts: postsWithLikes,
			fallbackTips,
			isEmpty: postsWithLikes.length === 0
		});
	} catch (err) {
		// R-03: nunca crashar
		console.error('[community] erro:', err);
		req.flash('error', 'Erro ao carregar a comunidade.');
		res.status(500).render('error', {
			message: 'Erro ao carregar comunidade',
			error: { status: 500, stack: '' }
		});
	}
};

/**
 * GET /post/:id - detalhe do post + comentários
 * Cobre R-12 (não exibir privado se viewer != dono)
 */
exports.show = async (req, res) => {
	try {
		const viewerId = req.session.user ? req.session.user.id : null;
		const post = await postService.findVisibleById(req.params.id, viewerId);

		if (!post) {
			return res.status(404).render('error', {
				message: 'Post não encontrado ou indisponível',
				error: { status: 404, stack: '' }
			});
		}

		const comments = await Comment.findAll({
			where: { postId: post.id },
			include: [
				{ model: User, as: 'author', attributes: ['id', 'username', 'fullName', 'profilePicture'] }
			],
			order: [['createdAt', 'ASC']]
		});

		const likes = await postService.countLikes(post.id);

		res.render('post-detail', {
			title: `${post.title} - Green Life`,
			post,
			comments,
			likes
		});
	} catch (err) {
		console.error('[post.show] erro:', err);
		req.flash('error', 'Erro ao carregar post.');
		res.redirect('/community');
	}
};

exports.showNew = async (req, res) => {
	const categories = await categoryService.listAll();
	res.render('post-form', {
		title: 'Novo post - Green Life',
		categories,
		post: null
	});
};

exports.create = async (req, res) => {
	try {
		const data = {
			...req.body,
			userId: req.session.user.id,
			image: req.file ? req.file.filename : null
		};
		const result = await postService.create(data);
		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/post/new');
		}
		req.flash('success', 'Post publicado!');
		res.redirect(`/post/${result.post.id}`);
	} catch (err) {
		console.error('[post.create] erro:', err);
		req.flash('error', 'Erro ao publicar post.');
		res.redirect('/post/new');
	}
};

exports.delete = async (req, res) => {
	const isAdmin = req.session.user.role === 'admin';
	const result = await postService.remove(req.params.id, req.session.user.id, isAdmin);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Post removido.');
	res.redirect('/community');
};
