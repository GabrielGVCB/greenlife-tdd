const adminService = require('./adminService');

exports.dashboard = async (req, res) => {
	try {
		const stats = await adminService.getDashboardStats();
		res.render('admin/dashboard', {
			title: 'Dashboard - Admin',
			stats
		});
	} catch (err) {
		console.error('[admin.dashboard] erro:', err);
		req.flash('error', 'Erro ao carregar dashboard.');
		res.redirect('/home');
	}
};

exports.users = async (req, res) => {
	const users = await adminService.listUsers();
	res.render('admin/users', {
		title: 'Usuários - Admin',
		users
	});
};

exports.toggleRole = async (req, res) => {
	const result = await adminService.toggleUserRole(req.params.id);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', `Role alterada para ${result.user.role}.`);
	res.redirect('/admin/users');
};

exports.deleteUser = async (req, res) => {
	// Evita auto-banimento
	if (parseInt(req.params.id) === req.session.user.id) {
		req.flash('error', 'Você não pode excluir a si mesmo.');
		return res.redirect('/admin/users');
	}
	const result = await adminService.deleteUser(req.params.id);
	if (!result.ok) req.flash('error', result.error);
	else req.flash('success', 'Usuário removido.');
	res.redirect('/admin/users');
};

exports.posts = async (req, res) => {
	const posts = await adminService.listAllPosts();
	res.render('admin/posts', {
		title: 'Moderação de posts - Admin',
		posts
	});
};
