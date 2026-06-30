/**
 * Testes de integração HTTP — Action Controller / Rotas
 *
 * Estratégia: os services são mockados via vi.mock → os testes verificam
 * apenas o comportamento HTTP (status codes, redirects), sem banco real.
 *
 * Cobre cenários:
 *   GET  /actions       — lista ações (sucesso e erro)
 *   GET  /actions/new   — formulário de nova ação
 *   POST /actions/new   — criação de ação (sucesso e falha)
 *   POST /actions/:id/delete — remoção de ação (sucesso e falha)
 *
 * Todos os endpoints exigem autenticação (middleware auth).
 */
import request from 'supertest';
import app from '../../app.js';

// ─── Mocks hoisted ──────────────────────────────────────────────────────────

const {
	mockListByUser,
	mockTotalImpactByUser,
	mockCountByUser,
	mockCreateAction,
	mockRemoveAction
} = vi.hoisted(() => ({
	mockListByUser: vi.fn(),
	mockTotalImpactByUser: vi.fn(),
	mockCountByUser: vi.fn(),
	mockCreateAction: vi.fn(),
	mockRemoveAction: vi.fn()
}));

const { mockListAllCategories } = vi.hoisted(() => ({
	mockListAllCategories: vi.fn()
}));

const { mockListAllTips } = vi.hoisted(() => ({
	mockListAllTips: vi.fn()
}));

vi.mock('../../modules/action/actionService.js', () => ({
	listByUser: mockListByUser,
	totalImpactByUser: mockTotalImpactByUser,
	countByUser: mockCountByUser,
	create: mockCreateAction,
	remove: mockRemoveAction
}));

vi.mock('../../modules/category/categoryService.js', () => ({
	listAll: mockListAllCategories
}));

vi.mock('../../modules/tip/tipService.js', () => ({
	listAll: mockListAllTips
}));

// Mock do userService para evitar conflitos com rotas de user
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Cria um agente autenticado para testes de rotas protegidas.
 * Simula login configurando cookie de sessão via POST /login.
 */
async function authenticatedAgent() {
	const agent = request.agent(app);
	const fakeUser = { id: 1, username: 'greenuser', fullName: 'Green User', role: 'user' };
	mockAuthenticate.mockResolvedValue({ ok: true, user: fakeUser });
	mockToSessionUser.mockReturnValue({ id: 1, username: 'greenuser', role: 'user' });

	await agent
		.post('/login')
		.type('form')
		.send({ login: 'greenuser', password: 'senha12345' });

	return agent;
}

// ─── GET /actions (lista) ────────────────────────────────────────────────────

describe('GET /actions — integração HTTP', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app).get('/actions');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('retorna 200 quando autenticado e renderiza lista de ações', async () => {
		const agent = await authenticatedAgent();
		mockListByUser.mockResolvedValue([
			{ id: 1, title: 'Plantio de árvores', impactKgCO2: 30 }
		]);
		mockTotalImpactByUser.mockResolvedValue(30);
		mockCountByUser.mockResolvedValue(1);

		const res = await agent.get('/actions');

		expect(res.status).toBe(200);
		expect(mockListByUser).toHaveBeenCalledWith(1);
	});

	it('redireciona para /home quando ocorre erro no service', async () => {
		const agent = await authenticatedAgent();
		mockListByUser.mockRejectedValue(new Error('Erro no banco'));

		const res = await agent.get('/actions');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/home');
	});
});

// ─── GET /actions/new (formulário) ───────────────────────────────────────────

describe('GET /actions/new — integração HTTP', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app).get('/actions/new');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('retorna 200 e renderiza o formulário quando autenticado', async () => {
		const agent = await authenticatedAgent();
		mockListAllCategories.mockResolvedValue([{ id: 1, name: 'Meio Ambiente' }]);
		mockListAllTips.mockResolvedValue([{ id: 1, title: 'Dica verde' }]);

		const res = await agent.get('/actions/new');

		expect(res.status).toBe(200);
		expect(mockListAllCategories).toHaveBeenCalled();
		expect(mockListAllTips).toHaveBeenCalled();
	});
});

// ─── POST /actions/new (criação) ─────────────────────────────────────────────

describe('POST /actions/new — integração HTTP', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app)
			.post('/actions/new')
			.type('form')
			.send({ title: 'Teste', impactKgCO2: 10 });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('redireciona para /actions após criação bem-sucedida', async () => {
		const agent = await authenticatedAgent();
		mockCreateAction.mockResolvedValue({
			ok: true,
			action: { id: 1, title: 'Plantio de árvores' }
		});

		const res = await agent
			.post('/actions/new')
			.type('form')
			.send({
				title: 'Plantio de árvores',
				description: 'Plantamos 10 árvores',
				impactKgCO2: 50,
				categoryId: 1
			});

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions');
	});

	it('redireciona para /actions/new quando service retorna erro de validação', async () => {
		const agent = await authenticatedAgent();
		mockCreateAction.mockResolvedValue({
			ok: false,
			error: 'Título da ação é obrigatório.'
		});

		const res = await agent
			.post('/actions/new')
			.type('form')
			.send({ title: '', impactKgCO2: 10 });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions/new');
	});

	it('redireciona para /actions/new quando ocorre erro inesperado', async () => {
		const agent = await authenticatedAgent();
		mockCreateAction.mockRejectedValue(new Error('Erro inesperado'));

		const res = await agent
			.post('/actions/new')
			.type('form')
			.send({ title: 'Ação', impactKgCO2: 10 });

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions/new');
	});
});

// ─── POST /actions/:id/delete (remoção) ──────────────────────────────────────

describe('POST /actions/:id/delete — integração HTTP', () => {
	it('redireciona para /login quando não autenticado', async () => {
		const res = await request(app).post('/actions/1/delete');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/login');
	});

	it('redireciona para /actions após remoção bem-sucedida', async () => {
		const agent = await authenticatedAgent();
		mockRemoveAction.mockResolvedValue({ ok: true });

		const res = await agent.post('/actions/1/delete');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions');
	});

	it('redireciona para /actions com flash de erro quando ação não existe', async () => {
		const agent = await authenticatedAgent();
		mockRemoveAction.mockResolvedValue({
			ok: false,
			error: 'Ação não encontrada.'
		});

		const res = await agent.post('/actions/999/delete');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions');
	});

	it('redireciona para /actions com flash de erro quando sem permissão', async () => {
		const agent = await authenticatedAgent();
		mockRemoveAction.mockResolvedValue({
			ok: false,
			error: 'Sem permissão.'
		});

		const res = await agent.post('/actions/5/delete');

		expect(res.status).toBe(302);
		expect(res.headers.location).toBe('/actions');
	});
});
