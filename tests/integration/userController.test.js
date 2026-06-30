/**
 * Testes de integração HTTP — User Controller (funções adicionais)
 *
 * Complementa os testes de userRoutes.test.js para cobrir funções
 * do controller que não estavam sendo testadas:
 *   GET  /login      — showLogin
 *   GET  /register   — showRegister
 *   GET  /profile/edit — showEditProfile (autenticado)
 *   POST /profile/edit — updateProfile (autenticado, sucesso e falha)
 */
import request from 'supertest';
import app from '../../app.js';

const { mockCreateUser, mockAuthenticate, mockToSessionUser, mockUpdateProfile } = vi.hoisted(() => ({
	mockCreateUser: vi.fn(),
	mockAuthenticate: vi.fn(),
	mockToSessionUser: vi.fn((u) => ({
		id: u?.id,
		username: u?.username,
		fullName: u?.fullName,
		email: u?.email,
		role: u?.role,
		profilePicture: u?.profilePicture,
		bio: u?.bio
	})),
	mockUpdateProfile: vi.fn()
}));

vi.mock('../../modules/user/userService.js', () => ({
	createUser: mockCreateUser,
	authenticate: mockAuthenticate,
	toSessionUser: mockToSessionUser,
	updateProfile: mockUpdateProfile,
	SALT_ROUNDS: 10
}));

/**
 * Cria um agente autenticado para testes de rotas protegidas.
 */
async function authenticatedAgent() {
	const agent = request.agent(app);
	const fakeUser = {
		id: 1,
		username: 'greenuser',
		fullName: 'Green User',
		email: 'green@test.com',
		role: 'user',
		profilePicture: null,
		bio: 'Bio teste'
	};
	mockAuthenticate.mockResolvedValue({ ok: true, user: fakeUser });
	mockToSessionUser.mockReturnValue({
		id: 1,
		username: 'greenuser',
		fullName: 'Green User',
		email: 'green@test.com',
		role: 'user',
		profilePicture: null,
		bio: 'Bio teste'
	});

	await agent
		.post('/login')
		.type('form')
		.send({ login: 'greenuser', password: 'senha12345' });

	return agent;
}

// ─── GET /login ──────────────────────────────────────────────────────────────

describe('GET /login — showLogin', () => {
	it('retorna 200 e renderiza página de login', async () => {
		const res = await request(app).get('/login');

		expect(res.status).toBe(200);
	});

	it('redireciona para /home se já estiver autenticado', async () => {
		const agent = await authenticatedAgent();

		const res = await agent.get('/login');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/home');
	});
});

// ─── GET /register ───────────────────────────────────────────────────────────

describe('GET /register — showRegister', () => {
	it('retorna 200 e renderiza página de cadastro', async () => {
		const res = await request(app).get('/register');

		expect(res.status).toBe(200);
	});

	it('redireciona para /home se já estiver autenticado', async () => {
		const agent = await authenticatedAgent();

		const res = await agent.get('/register');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/home');
	});
});

// ─── GET /profile/edit ───────────────────────────────────────────────────────

describe('GET /profile/edit — showEditProfile', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app).get('/profile/edit');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('retorna 200 e renderiza formulário de edição quando autenticado', async () => {
		const agent = await authenticatedAgent();

		const res = await agent.get('/profile/edit');

		expect(res.status).toBe(200);
	});
});

// ─── POST /profile/edit ──────────────────────────────────────────────────────

describe('POST /profile/edit — updateProfile', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app)
			.post('/profile/edit')
			.type('form')
			.send({ fullName: 'Novo Nome', bio: 'Nova bio' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('redireciona para /profile/edit com sucesso após atualizar perfil', async () => {
		const agent = await authenticatedAgent();
		const updatedUser = {
			id: 1,
			username: 'greenuser',
			fullName: 'Nome Atualizado',
			email: 'green@test.com',
			role: 'user',
			profilePicture: null,
			bio: 'Bio atualizada'
		};
		mockUpdateProfile.mockResolvedValue({ ok: true, user: updatedUser });

		const res = await agent
			.post('/profile/edit')
			.type('form')
			.send({ fullName: 'Nome Atualizado', bio: 'Bio atualizada' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/profile/edit');
		expect(mockUpdateProfile).toHaveBeenCalledWith(1, expect.objectContaining({
			fullName: 'Nome Atualizado',
			bio: 'Bio atualizada'
		}));
	});

	it('redireciona para /profile/edit com erro quando service rejeita', async () => {
		const agent = await authenticatedAgent();
		mockUpdateProfile.mockResolvedValue({ ok: false, error: 'Usuário não encontrado.' });

		const res = await agent
			.post('/profile/edit')
			.type('form')
			.send({ fullName: 'Nome', bio: 'Bio' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/profile/edit');
	});
});
