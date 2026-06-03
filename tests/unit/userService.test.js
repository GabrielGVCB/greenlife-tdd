/**
 * Testes unitários para userService
 *
 * Cobre Riscos:
 *  - R-01 (senha em texto plano) — valida que bcryptjs.hash é SEMPRE chamado
 *  - R-04 (email inválido)
 *  - R-11 (senha curta)
 *
 * Usa vi.mock para isolar a dependência do model (banco de dados).
 */
import bcryptjs from 'bcryptjs';

const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockFindByPk = vi.fn();

vi.mock('../../modules/user/userModel.js', () => ({
	default: {
		findOne: mockFindOne,
		create: mockCreate,
		findByPk: mockFindByPk
	}
}));

const userService = await import('../../modules/user/userService.js');

describe('userService.createUser', () => {
	beforeEach(() => {
		mockFindOne.mockResolvedValue(null);
		mockCreate.mockImplementation((data) => Promise.resolve({ id: 1, ...data }));
	});

	it('[R-01] NUNCA salva senha em texto plano', async () => {
		const result = await userService.createUser({
			username: 'maria',
			fullName: 'Maria Silva',
			email: 'maria@greenlife.com',
			password: 'senhaSegura123'
		});

		expect(result.ok).toBe(true);
		expect(mockCreate).toHaveBeenCalledOnce();

		const createdData = mockCreate.mock.calls[0][0];
		expect(createdData.password).not.toBe('senhaSegura123');
		expect(createdData.password).toMatch(/^\$2[aby]\$/);
	});

	it('[R-01] O hash gerado deve ser verificável com bcryptjs.compare', async () => {
		await userService.createUser({
			username: 'joao',
			fullName: 'João Verde',
			email: 'joao@greenlife.com',
			password: 'minhaSenha12345'
		});

		const hashedPassword = mockCreate.mock.calls[0][0].password;
		const match = await bcryptjs.compare('minhaSenha12345', hashedPassword);
		expect(match).toBe(true);
	});

	it('[R-04] rejeita e-mail sem @', async () => {
		const result = await userService.createUser({
			username: 'testuser',
			fullName: 'Test User',
			email: 'emailInvalido',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/e-mail/i);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('[R-04] rejeita e-mail sem domínio', async () => {
		const result = await userService.createUser({
			username: 'testuser',
			fullName: 'Test User',
			email: 'user@',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/e-mail/i);
	});

	it('[R-11] rejeita senha com 7 caracteres', async () => {
		const result = await userService.createUser({
			username: 'testuser',
			fullName: 'Test User',
			email: 'test@example.com',
			password: '1234567'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/senha/i);
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('[R-11] aceita senha com exatamente 8 caracteres', async () => {
		const result = await userService.createUser({
			username: 'testuser',
			fullName: 'Test User',
			email: 'test@example.com',
			password: '12345678'
		});
		expect(result.ok).toBe(true);
	});

	it('rejeita e-mail duplicado', async () => {
		mockFindOne.mockResolvedValueOnce({ id: 99, email: 'existente@example.com' });
		const result = await userService.createUser({
			username: 'novo',
			fullName: 'Novo User',
			email: 'existente@example.com',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/já cadastrado/i);
	});

	it('rejeita username inválido com caractere especial', async () => {
		const result = await userService.createUser({
			username: 'user@name',
			fullName: 'Test User',
			email: 'test@example.com',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/usuário/i);
	});

	it('rejeita username com menos de 3 caracteres', async () => {
		const result = await userService.createUser({
			username: 'ab',
			fullName: 'Test User',
			email: 'test@example.com',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/usuário/i);
	});

	it('rejeita fullName vazio', async () => {
		const result = await userService.createUser({
			username: 'validuser',
			fullName: '',
			email: 'test@example.com',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/nome/i);
	});
});

describe('userService.toSessionUser', () => {
	it('remove senha ao sanitizar para sessão', () => {
		const user = {
			id: 1,
			username: 'maria',
			fullName: 'Maria',
			email: 'maria@g.com',
			password: '$2b$10$hashsecret',
			role: 'user'
		};
		const sessionUser = userService.toSessionUser(user);
		expect(sessionUser.password).toBeUndefined();
		expect(sessionUser.username).toBe('maria');
	});
});

describe('userService.authenticate', () => {
	it('[R-02] rejeita quando login está vazio', async () => {
		const result = await userService.authenticate('', 'senha123');
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/incompletas/i);
		expect(mockFindOne).not.toHaveBeenCalled();
	});

	it('[R-02] rejeita quando senha está vazia', async () => {
		const result = await userService.authenticate('user@test.com', '');
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/incompletas/i);
		expect(mockFindOne).not.toHaveBeenCalled();
	});

	it('[R-02] retorna erro para usuário inexistente', async () => {
		mockFindOne.mockResolvedValue(null);
		const result = await userService.authenticate('ghost@test.com', 'qualquersenha');
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/incorretos/i);
	});

	it('[R-02] retorna erro quando a senha está errada', async () => {
		const hash = await bcryptjs.hash('senhaCorreta123', 10);
		mockFindOne.mockResolvedValue({ id: 1, email: 'u@t.com', password: hash, role: 'user' });
		const result = await userService.authenticate('u@t.com', 'senhaErrada');
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/incorretos/i);
	});

	it('[R-02] autentica com sucesso por e-mail', async () => {
		const hash = await bcryptjs.hash('senhaCorreta123', 10);
		const fakeUser = { id: 1, email: 'u@t.com', username: 'uone', password: hash, role: 'user' };
		mockFindOne.mockResolvedValue(fakeUser);
		const result = await userService.authenticate('u@t.com', 'senhaCorreta123');
		expect(result.ok).toBe(true);
		expect(result.user).toEqual(fakeUser);
	});

	it('[R-02] autentica com sucesso por username (fallback)', async () => {
		const hash = await bcryptjs.hash('senhaCorreta123', 10);
		const fakeUser = { id: 2, email: 'u2@t.com', username: 'utwo', password: hash, role: 'user' };
		mockFindOne
			.mockResolvedValueOnce(null)       // busca por e-mail: não encontrado
			.mockResolvedValueOnce(fakeUser);  // busca por username: encontrado
		const result = await userService.authenticate('utwo', 'senhaCorreta123');
		expect(result.ok).toBe(true);
		expect(result.user.username).toBe('utwo');
	});
});

describe('userService.updateProfile', () => {
	it('retorna erro se userId não existe no banco', async () => {
		mockFindByPk.mockResolvedValue(null);
		const result = await userService.updateProfile(999, { fullName: 'Novo Nome' });
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/não encontrado/i);
	});

	it('atualiza fullName e bio com sucesso', async () => {
		const mockUserRecord = {
			id: 1,
			fullName: 'Nome Antigo',
			bio: null,
			profilePicture: null,
			save: vi.fn().mockResolvedValue(undefined)
		};
		mockFindByPk.mockResolvedValue(mockUserRecord);
		const result = await userService.updateProfile(1, { fullName: 'Nome Novo', bio: 'Bio nova' });
		expect(result.ok).toBe(true);
		expect(mockUserRecord.fullName).toBe('Nome Novo');
		expect(mockUserRecord.bio).toBe('Bio nova');
		expect(mockUserRecord.save).toHaveBeenCalledOnce();
	});
});
