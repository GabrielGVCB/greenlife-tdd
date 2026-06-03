/**
 * Testes de integração HTTP — User Controller / Rotas
 *
 * Estratégia: o userService é mockado via vi.mock → os testes verificam
 * apenas o comportamento HTTP (status codes, redirects), sem banco real.
 *
 * Cobre (Tabela de Decisão):
 *   POST /register — sucesso, senhas diferentes, email inválido, senha curta, duplicado
 *   POST /login    — sucesso, credenciais erradas, campos vazios
 *   GET  /logout   — destrói sessão e redireciona
 */
import request from 'supertest';
import app from '../../app.js';

const { mockCreateUser, mockAuthenticate, mockToSessionUser, mockUpdateProfile } = vi.hoisted(() => ({
	mockCreateUser: vi.fn(),
	mockAuthenticate: vi.fn(),
	mockToSessionUser: vi.fn((u) => ({ id: u?.id, username: u?.username, role: u?.role })),
	mockUpdateProfile: vi.fn()
}));

vi.mock('../../modules/user/userService.js', () => ({
	createUser: mockCreateUser,
	authenticate: mockAuthenticate,
	toSessionUser: mockToSessionUser,
	updateProfile: mockUpdateProfile,
	SALT_ROUNDS: 10
}));

// ─── POST /register ──────────────────────────────────────────────────────────

describe('POST /register — integração HTTP (R-04, R-11)', () => {
	it('redireciona para /login após cadastro bem-sucedido', async () => {
		mockCreateUser.mockResolvedValue({ ok: true, user: { id: 1, username: 'maria' } });

		const res = await request(app)
			.post('/register')
			.type('form')
			.send({
				username: 'maria',
				fullName: 'Maria Silva',
				email: 'maria@greenlife.com',
				password: 'senhaSegura123',
				confirmPassword: 'senhaSegura123'
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('redireciona para /register quando senhas não conferem', async () => {
		const res = await request(app)
			.post('/register')
			.type('form')
			.send({
				username: 'joao',
				fullName: 'João Verde',
				email: 'joao@greenlife.com',
				password: 'senhaA123',
				confirmPassword: 'senhaB456'
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/register');
		expect(mockCreateUser).not.toHaveBeenCalled();
	});

	it('redireciona para /register quando o service rejeita e-mail inválido', async () => {
		mockCreateUser.mockResolvedValue({ ok: false, error: 'E-mail inválido.' });

		const res = await request(app)
			.post('/register')
			.type('form')
			.send({
				username: 'teste',
				fullName: 'Teste User',
				email: 'emailinvalido',
				password: 'senhaok123',
				confirmPassword: 'senhaok123'
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/register');
	});

	it('redireciona para /register quando o service rejeita senha curta', async () => {
		mockCreateUser.mockResolvedValue({ ok: false, error: 'Senha deve ter no mínimo 8 caracteres.' });

		const res = await request(app)
			.post('/register')
			.type('form')
			.send({
				username: 'teste',
				fullName: 'Teste User',
				email: 'teste@greenlife.com',
				password: '123',
				confirmPassword: '123'
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/register');
	});

	it('redireciona para /register quando e-mail já está cadastrado', async () => {
		mockCreateUser.mockResolvedValue({ ok: false, error: 'E-mail já cadastrado.' });

		const res = await request(app)
			.post('/register')
			.type('form')
			.send({
				username: 'novo',
				fullName: 'Novo User',
				email: 'existente@greenlife.com',
				password: 'senhaok123',
				confirmPassword: 'senhaok123'
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/register');
	});
});

// ─── POST /login ─────────────────────────────────────────────────────────────

describe('POST /login — integração HTTP (R-02)', () => {
	it('redireciona para /home após login bem-sucedido', async () => {
		const fakeUser = { id: 1, username: 'maria', fullName: 'Maria Silva', role: 'user' };
		mockAuthenticate.mockResolvedValue({ ok: true, user: fakeUser });
		mockToSessionUser.mockReturnValue({ id: 1, username: 'maria', role: 'user' });

		const res = await request(app)
			.post('/login')
			.type('form')
			.send({ login: 'maria@greenlife.com', password: 'senhaSegura123' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/home');
	});

	it('redireciona para /login com credenciais incorretas', async () => {
		mockAuthenticate.mockResolvedValue({ ok: false, error: 'Usuário ou senha incorretos.' });

		const res = await request(app)
			.post('/login')
			.type('form')
			.send({ login: 'naoexiste@greenlife.com', password: 'senhaErrada' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('redireciona para /login quando os campos estão vazios', async () => {
		mockAuthenticate.mockResolvedValue({ ok: false, error: 'Credenciais incompletas.' });

		const res = await request(app)
			.post('/login')
			.type('form')
			.send({ login: '', password: '' });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});
});

// ─── GET /logout ─────────────────────────────────────────────────────────────

describe('GET /logout', () => {
	it('destrói sessão e redireciona para /', async () => {
		const res = await request(app).get('/logout');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/');
	});
});
