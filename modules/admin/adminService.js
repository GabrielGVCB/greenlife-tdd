import User from '../user/userModel.js';
import Tip from '../tip/tipModel.js';
import Post from '../post/postModel.js';
import Comment from '../comment/commentModel.js';
import Action from '../action/actionModel.js';
import Category from '../category/categoryModel.js';

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

export { getDashboardStats, listUsers, toggleUserRole, deleteUser, listAllPosts };
