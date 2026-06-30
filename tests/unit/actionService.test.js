/**
 * Testes unitários para actionService
 *
 * Cobre a nova funcionalidade: Registro de Ação Sustentável com Categorização
 *
 * Cenários testados:
 *  - Criação de ação com sucesso
 *  - Validações de título (obrigatório, mínimo 3 chars)
 *  - Validação de userId obrigatório
 *  - Listagem de ações por usuário
 *  - Cálculo de impacto total por usuário
 *  - Contagem de ações por usuário
 *  - Remoção de ação com sucesso
 *  - Remoção de ação inexistente
 *  - Remoção sem permissão
 *
 * Usa vi.mock para isolar a dependência do model (banco de dados).
 */

const mockCreate = vi.fn();
const mockFindAll = vi.fn();
const mockSum = vi.fn();
const mockCount = vi.fn();
const mockFindByPk = vi.fn();

vi.mock('../../modules/action/actionModel.js', () => ({
	default: {
		create: mockCreate,
		findAll: mockFindAll,
		sum: mockSum,
		count: mockCount,
		findByPk: mockFindByPk
	}
}));

vi.mock('../../modules/category/categoryModel.js', () => ({
	default: {}
}));

vi.mock('../../modules/tip/tipModel.js', () => ({
	default: {}
}));

vi.mock('sequelize', () => ({
	fn: vi.fn(),
	col: vi.fn()
}));

const actionService = await import('../../modules/action/actionService.js');

// ─── actionService.create ────────────────────────────────────────────────────

describe('actionService.create', () => {
	beforeEach(() => {
		mockCreate.mockImplementation((data) =>
			Promise.resolve({ id: 1, ...data })
		);
	});

	it('cria ação sustentável com sucesso quando dados são válidos', async () => {
		const result = await actionService.create({
			title: 'Plantio de árvores',
			description: 'Plantamos 10 árvores no parque',
			impactKgCO2: 50.5,
			userId: 1,
			tipId: 2,
			categoryId: 3
		});

		expect(result.ok).toBe(true);
		expect(result.action).toHaveProperty('id');
		expect(mockCreate).toHaveBeenCalledOnce();
	});

	it('cria ação com título trimado (removendo espaços)', async () => {
		await actionService.create({
			title: '  Coleta seletiva  ',
			userId: 1
		});

		const createdData = mockCreate.mock.calls[0][0];
		expect(createdData.title).toBe('Coleta seletiva');
	});

	it('rejeita ação com título vazio', async () => {
		const result = await actionService.create({
			title: '',
			userId: 1
		});

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/título/i);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('rejeita ação com título menor que 3 caracteres', async () => {
		const result = await actionService.create({
			title: 'ab',
			userId: 1
		});

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/título/i);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('rejeita ação sem userId', async () => {
		const result = await actionService.create({
			title: 'Ação válida',
			userId: null
		});

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/usuário/i);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('define impactKgCO2 como 0 quando valor não é numérico', async () => {
		await actionService.create({
			title: 'Economia de água',
			impactKgCO2: 'abc',
			userId: 1
		});

		const createdData = mockCreate.mock.calls[0][0];
		expect(createdData.impactKgCO2).toBe(0);
	});

	it('define description como null quando não fornecida', async () => {
		await actionService.create({
			title: 'Sem descrição',
			userId: 1
		});

		const createdData = mockCreate.mock.calls[0][0];
		expect(createdData.description).toBeNull();
	});

	it('define tipId e categoryId como null quando não fornecidos', async () => {
		await actionService.create({
			title: 'Ação simples',
			userId: 1
		});

		const createdData = mockCreate.mock.calls[0][0];
		expect(createdData.tipId).toBeNull();
		expect(createdData.categoryId).toBeNull();
	});
});

// ─── actionService.listByUser ────────────────────────────────────────────────

describe('actionService.listByUser', () => {
	it('retorna lista de ações do usuário com includes corretos', async () => {
		const fakeActions = [
			{ id: 1, title: 'Plantio', userId: 1, category: { name: 'Meio Ambiente' } },
			{ id: 2, title: 'Reciclagem', userId: 1, category: { name: 'Resíduos' } }
		];
		mockFindAll.mockResolvedValue(fakeActions);

		const result = await actionService.listByUser(1);

		expect(result).toHaveLength(2);
		expect(mockFindAll).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId: 1 },
				order: [['createdAt', 'DESC']]
			})
		);
	});

	it('retorna array vazio quando usuário não tem ações', async () => {
		mockFindAll.mockResolvedValue([]);

		const result = await actionService.listByUser(999);

		expect(result).toEqual([]);
	});
});

// ─── actionService.totalImpactByUser ─────────────────────────────────────────

describe('actionService.totalImpactByUser', () => {
	it('retorna soma de impacto em KgCO2 do usuário', async () => {
		mockSum.mockResolvedValue(150.75);

		const result = await actionService.totalImpactByUser(1);

		expect(result).toBe(150.75);
		expect(mockSum).toHaveBeenCalledWith('impactKgCO2', { where: { userId: 1 } });
	});

	it('retorna 0 quando usuário não tem ações registradas', async () => {
		mockSum.mockResolvedValue(null);

		const result = await actionService.totalImpactByUser(999);

		expect(result).toBe(0);
	});
});

// ─── actionService.countByUser ───────────────────────────────────────────────

describe('actionService.countByUser', () => {
	it('retorna contagem correta de ações do usuário', async () => {
		mockCount.mockResolvedValue(5);

		const result = await actionService.countByUser(1);

		expect(result).toBe(5);
		expect(mockCount).toHaveBeenCalledWith({ where: { userId: 1 } });
	});
});

// ─── actionService.remove ────────────────────────────────────────────────────

describe('actionService.remove', () => {
	it('remove ação com sucesso quando ação pertence ao usuário', async () => {
		const mockAction = {
			id: 1,
			userId: 1,
			destroy: vi.fn().mockResolvedValue(undefined)
		};
		mockFindByPk.mockResolvedValue(mockAction);

		const result = await actionService.remove(1, 1);

		expect(result.ok).toBe(true);
		expect(mockAction.destroy).toHaveBeenCalledOnce();
	});

	it('retorna erro quando ação não é encontrada', async () => {
		mockFindByPk.mockResolvedValue(null);

		const result = await actionService.remove(999, 1);

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/não encontrada/i);
	});

	it('retorna erro quando usuário não é dono da ação (sem permissão)', async () => {
		const mockAction = { id: 1, userId: 2 };
		mockFindByPk.mockResolvedValue(mockAction);

		const result = await actionService.remove(1, 99);

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/permissão/i);
	});
});
