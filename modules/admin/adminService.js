const User = require('../user/userModel');
const Tip = require('../tip/tipModel');
const Post = require('../post/postModel');
const Comment = require('../comment/commentModel');
const Action = require('../action/actionModel');
const Category = require('../category/categoryModel');

/**
 * Retorna as estatísticas do Dashboard administrativo.
 */
async function getDashboardStats() {
	const [totalUsers, totalTips, totalPosts, totalComments, totalActions, totalCategories] =
		await Promise.all([
			User.count(),
			Tip.count(),
			Post.count(),
			Comment.count(),
			Action.count(),
			Category.count()
		]);

	const totalImpact = (await Action.sum('impactKgCO2')) || 0;

	return {
		totalUsers,
		totalTips,
		totalPosts,
		totalComments,
		totalActions,
		totalCategories,
		totalImpact: Number(totalImpact).toFixed(2)
	};
}

async function listUsers() {
	return User.findAll({
		attributes: ['id', 'username', 'fullName', 'email', 'role', 'createdAt'],
		order: [['createdAt', 'DESC']]
	});
}

async function toggleUserRole(userId) {
	const user = await User.findByPk(userId);
	if (!user) return { ok: false, error: 'Usuário não encontrado.' };
	user.role = user.role === 'admin' ? 'user' : 'admin';
	await user.save();
	return { ok: true, user };
}

async function deleteUser(userId) {
	const user = await User.findByPk(userId);
	if (!user) return { ok: false, error: 'Usuário não encontrado.' };
	await user.destroy();
	return { ok: true };
}

async function listAllPosts() {
	return Post.findAll({
		include: [{ model: User, as: 'author', attributes: ['id', 'username', 'fullName'] }],
		order: [['createdAt', 'DESC']]
	});
}

module.exports = {
	getDashboardStats,
	listUsers,
	toggleUserRole,
	deleteUser,
	listAllPosts
};
