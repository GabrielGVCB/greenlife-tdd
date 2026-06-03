import * as categoryService from './categoryService.js';
import * as tipService from '../tip/tipService.js';
import * as postService from '../post/postService.js';

/**
 * GET /home → tela "Aprenda práticas sustentáveis"
 * Lista todas as categorias com contagem de dicas (cobre R-03 com try/catch)
 */
export const showHome = async (req, res) => {
	try {
		const categories = await categoryService.listAll();
		const tips = await tipService.listAll({ limit: 20 });

		// Stats simples para a hero
		const stats = {
			totalCategories: categories.length,
			totalTips: tips.length
		};

		res.render('home', {
			title: 'Green Life - Aprenda práticas sustentáveis',
			categories,
			tips,
			stats
		});
	} catch (err) {
		// Cobre R-03: nunca derrubar o app
		console.error('[showHome] erro:', err);
		req.flash('error', 'Não foi possível carregar as dicas no momento. Tente novamente.');
		res.status(500).render('error', {
			message: 'Erro ao carregar a home',
			error: { status: 500, stack: '' }
		});
	}
};

/**
 * GET /category/:slug → detalhes de uma categoria com dicas e mini-feed
 */
export const showCategory = async (req, res) => {
	try {
		const category = await categoryService.findBySlug(req.params.slug);
		if (!category) {
			return res.status(404).render('error', {
				message: 'Categoria não encontrada',
				error: { status: 404, stack: '' }
			});
		}

		const tips = await tipService.listByCategory(category.id);
		const recentPosts = await postService.listByCategory(category.id, {
			limit: 3,
			viewerId: req.session.user ? req.session.user.id : null
		});

		res.render('category', {
			title: `${category.name} - Green Life`,
			category,
			tips,
			recentPosts
		});
	} catch (err) {
		console.error('[showCategory] erro:', err);
		req.flash('error', 'Não foi possível carregar a categoria.');
		res.status(500).render('error', {
			message: 'Erro ao carregar categoria',
			error: { status: 500, stack: '' }
		});
	}
};

// === ADMIN ===

export const adminList = async (req, res) => {
	const categories = await categoryService.listAll();
	res.render('admin/categories', {
		title: 'Gerenciar categorias - Admin',
		categories
	});
};

export const adminCreate = async (req, res) => {
	const result = await categoryService.create(req.body);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Categoria criada com sucesso!');
	res.redirect('/admin/categories');
};

export const adminUpdate = async (req, res) => {
	const result = await categoryService.update(req.params.id, req.body);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Categoria atualizada!');
	res.redirect('/admin/categories');
};

export const adminDelete = async (req, res) => {
	const result = await categoryService.remove(req.params.id);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Categoria removida.');
	res.redirect('/admin/categories');
};
