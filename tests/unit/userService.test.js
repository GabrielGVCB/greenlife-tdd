/**
 * Testes unitários para userService.createUser
 *
 * Cobre Riscos:
 *  - R-01 (senha em texto plano) — valida que bcrypt.hash é SEMPRE chamado
 *  - R-04 (email inválido)
 *  - R-11 (senha curta)
 *
 * Os Models são mockados para isolar a lógica do service.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

// Mocka o model do User
vi.mock('../../modules/user/userModel.js', () => ({
	default: {
		findOne: vi.fn(),
		create: vi.fn()
	}
}));

const User = (await import('../../modules/user/userModel.js')).default;
const userService = await import('../../modules/user/userService.js');

describe('userService.createUser', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		User.findOne.mockResolvedValue(null); // nenhum usuário duplicado por padrão
		User.create.mockImplementation((data) => Promise.resolve({ id: 1, ...data }));
	});

	it('[R-01] NUNCA salva senha em texto plano', async () => {
		const result = await userService.createUser({
			username: 'maria',
			fullName: 'Maria Silva',
			email: 'maria@greenlife.com',
			password: 'senhaSegura123'
		});

		expect(result.ok).toBe(true);
		expect(User.create).toHaveBeenCalledOnce();

		const createdData = User.create.mock.calls[0][0];
		// A senha salva NÃO pode ser "senhaSegura123"
		expect(createdData.password).not.toBe('senhaSegura123');
		// E deve ter o formato bcrypt ($2a$, $2b$, $2y$)
		expect(createdData.password).toMatch(/^\$2[aby]\$/);
	});

	it('[R-01] O hash gerado deve ser verificável com bcrypt.compare', async () => {
		await userService.createUser({
			username: 'joao',
			fullName: 'João Verde',
			email: 'joao@greenlife.com',
			password: 'minhaSenha12345'
		});

		const hashedPassword = User.create.mock.calls[0][0].password;
		const match = await bcrypt.compare('minhaSenha12345', hashedPassword);
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
		expect(User.create).not.toHaveBeenCalled();
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
		expect(User.create).not.toHaveBeenCalled();
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
		User.findOne.mockResolvedValueOnce({ id: 99, email: 'existente@example.com' });
		const result = await userService.createUser({
			username: 'novo',
			fullName: 'Novo User',
			email: 'existente@example.com',
			password: 'abcdefgh'
		});
		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/já cadastrado/i);
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
