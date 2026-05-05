const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('./userModel');
const {
	isValidEmail,
	isValidPassword,
	isValidUsername
} = require('../../middlewares/validators');

const SALT_ROUNDS = 10;

/**
 * Cria um novo usuário.
 * Cobre R-01 (bcrypt), R-04 (email), R-11 (senha ≥ 8 chars).
 */
async function createUser(data) {
	const { username, fullName, email, password, role } = data;

	const usernameCheck = isValidUsername(username);
	if (!usernameCheck.valid) return { ok: false, error: usernameCheck.message };

	if (!fullName || fullName.trim().length < 2) {
		return { ok: false, error: 'Nome completo é obrigatório.' };
	}

	const emailCheck = isValidEmail(email);
	if (!emailCheck.valid) return { ok: false, error: emailCheck.message };

	const passwordCheck = isValidPassword(password);
	if (!passwordCheck.valid) return { ok: false, error: passwordCheck.message };

	const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } });
	if (existing) return { ok: false, error: 'E-mail já cadastrado.' };

	const existingUser = await User.findOne({ where: { username: username.trim() } });
	if (existingUser) return { ok: false, error: 'Nome de usuário já em uso.' };

	// HASH OBRIGATÓRIO (R-01)
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

	const user = await User.create({
		username: username.trim(),
		fullName: fullName.trim(),
		email: email.trim().toLowerCase(),
		password: hashedPassword,
		role: role === 'admin' ? 'admin' : 'user'
	});

	return { ok: true, user };
}

/**
 * Autentica usuário — aceita email OU username no campo `login`.
 *
 * Busca em 2 etapas (evita problemas com Op.or + paranoid em algumas versões).
 * Inclui logs de debug (remova DEBUG_AUTH em produção).
 */
async function authenticate(login, password) {
	const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true' || process.env.NODE_ENV === 'development';

	if (!login || !password) {
		if (DEBUG_AUTH) console.log('[AUTH] credenciais incompletas');
		return { ok: false, error: 'Credenciais incompletas.' };
	}

	const loginClean = String(login).trim();
	const loginLower = loginClean.toLowerCase();

	if (DEBUG_AUTH) console.log(`[AUTH] tentativa de login com: "${loginClean}"`);

	// 1ª tentativa: por e-mail (normalizado em lowercase)
	let user = await User.findOne({ where: { email: loginLower } });

	// 2ª tentativa: por username (case-sensitive como foi cadastrado)
	if (!user) {
		user = await User.findOne({ where: { username: loginClean } });
	}

	if (!user) {
		if (DEBUG_AUTH) console.log(`[AUTH] ❌ nenhum usuário encontrado para "${loginClean}"`);
		return { ok: false, error: 'Usuário ou senha incorretos.' };
	}

	if (DEBUG_AUTH) {
		console.log(`[AUTH] ✅ usuário encontrado: id=${user.id} email=${user.email} role=${user.role}`);
		console.log(`[AUTH] hash no banco começa com: ${user.password.substring(0, 7)}...`);
	}

	const match = await bcrypt.compare(password, user.password);

	if (DEBUG_AUTH) console.log(`[AUTH] bcrypt.compare resultado: ${match}`);

	if (!match) return { ok: false, error: 'Usuário ou senha incorretos.' };

	return { ok: true, user };
}

async function updateProfile(userId, data) {
	const user = await User.findByPk(userId);
	if (!user) return { ok: false, error: 'Usuário não encontrado.' };

	const { fullName, bio, profilePicture } = data;
	if (fullName !== undefined) user.fullName = fullName;
	if (bio !== undefined) user.bio = bio;
	if (profilePicture !== undefined) user.profilePicture = profilePicture;

	await user.save();
	return { ok: true, user };
}

function toSessionUser(user) {
	return {
		id: user.id,
		username: user.username,
		fullName: user.fullName,
		email: user.email,
		role: user.role,
		profilePicture: user.profilePicture,
		bio: user.bio
	};
}

module.exports = {
	createUser,
	authenticate,
	updateProfile,
	toSessionUser,
	SALT_ROUNDS
};
