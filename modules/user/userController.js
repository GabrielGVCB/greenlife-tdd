import * as userService from './userService.js';

/**
 * GET /login
 */
export const showLogin = (req, res) => {
	if (req.session.user) return res.redirect('/home');
	res.render('login', { title: 'Entrar - Green Life' });
};

/**
 * POST /login
 * Cobre R-01 (compara hash bcrypt) e dá feedback genérico para não vazar info.
 */
export const login = async (req, res) => {
	try {
		const { login, password } = req.body;
		const result = await userService.authenticate(login, password);

		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/login');
		}

		req.session.user = userService.toSessionUser(result.user);
		req.flash('success', `Bem-vindo de volta, ${result.user.fullName}! 🌱`);
		res.redirect('/home');
	} catch (err) {
		// Cobre R-03: nunca crashar — sempre tratar exceção
		console.error('[login] erro:', err);
		req.flash('error', 'Erro interno. Tente novamente em instantes.');
		res.redirect('/login');
	}
};

/**
 * GET /register
 */
export const showRegister = (req, res) => {
	if (req.session.user) return res.redirect('/home');
	res.render('register', { title: 'Criar conta - Green Life' });
};

/**
 * POST /register
 * Cobre R-04 (email), R-11 (senha curta) via service.
 */
export const register = async (req, res) => {
	try {
		const { username, fullName, email, password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			req.flash('error', 'As senhas não conferem.');
			return res.redirect('/register');
		}

		const result = await userService.createUser({
			username,
			fullName,
			email,
			password
		});

		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/register');
		}

		req.flash('success', 'Conta criada com sucesso! Faça login para continuar.');
		res.redirect('/login');
	} catch (err) {
		console.error('[register] erro:', err);
		req.flash('error', 'Erro ao criar conta. Tente novamente.');
		res.redirect('/register');
	}
};

/**
 * GET /logout
 */
export const logout = (req, res) => {
	req.session.destroy(() => {
		res.redirect('/');
	});
};

/**
 * GET /profile/edit
 */
export const showEditProfile = (req, res) => {
	res.render('edit-profile', {
		title: 'Editar perfil - Green Life',
		user: req.session.user
	});
};

/**
 * POST /profile/edit
 */
export const updateProfile = async (req, res) => {
	try {
		const { fullName, bio } = req.body;
		const updateData = { fullName, bio };

		if (req.file) {
			updateData.profilePicture = req.file.filename;
		}

		const result = await userService.updateProfile(req.session.user.id, updateData);

		if (!result.ok) {
			req.flash('error', result.error);
			return res.redirect('/profile/edit');
		}

		// Atualiza sessão
		req.session.user = userService.toSessionUser(result.user);
		req.flash('success', 'Perfil atualizado com sucesso!');
		res.redirect('/profile/edit');
	} catch (err) {
		console.error('[updateProfile] erro:', err);
		req.flash('error', 'Erro ao atualizar perfil.');
		res.redirect('/profile/edit');
	}
};
