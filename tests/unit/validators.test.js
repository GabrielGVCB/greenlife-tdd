/**
 * Testes unitários para middlewares/validators.js
 *
 * Cobre Riscos:
 *  - R-04 (email inválido)
 *  - R-11 (senha curta)
 *  - R-08 (conteúdo muito longo)
 *  - R-07 (sanitização XSS)
 */
import {
	isValidEmail,
	isValidPassword,
	isValidUsername,
	isValidContent,
	sanitizeText,
	CONTENT_MAX
} from '../../middlewares/validators.js';

describe('isValidEmail (R-04)', () => {
	it('aceita e-mail válido', () => {
		expect(isValidEmail('maria@greenlife.com').valid).toBe(true);
	});

	it('rejeita string sem @', () => {
		const r = isValidEmail('teste123');
		expect(r.valid).toBe(false);
		expect(r.message).toMatch(/inválido/i);
	});

	it('rejeita string sem domínio', () => {
		expect(isValidEmail('user@').valid).toBe(false);
	});

	it('rejeita string sem usuário', () => {
		expect(isValidEmail('@dominio.com').valid).toBe(false);
	});

	it('rejeita string vazia e null', () => {
		expect(isValidEmail('').valid).toBe(false);
		expect(isValidEmail(null).valid).toBe(false);
		expect(isValidEmail(undefined).valid).toBe(false);
	});
});

describe('isValidPassword (R-11)', () => {
	it('rejeita senha com 7 chars (abaixo do mínimo)', () => {
		expect(isValidPassword('1234567').valid).toBe(false);
	});

	it('aceita senha com exatamente 8 chars (valor mínimo)', () => {
		expect(isValidPassword('12345678').valid).toBe(true);
	});

	it('aceita senha com 9 chars (acima do mínimo)', () => {
		expect(isValidPassword('123456789').valid).toBe(true);
	});

	it('rejeita string vazia', () => {
		expect(isValidPassword('').valid).toBe(false);
	});

	it('rejeita null/undefined', () => {
		expect(isValidPassword(null).valid).toBe(false);
		expect(isValidPassword(undefined).valid).toBe(false);
	});
});

describe('isValidUsername', () => {
	it('aceita username alfanumérico', () => {
		expect(isValidUsername('maria_silva').valid).toBe(true);
	});

	it('rejeita com caracteres especiais', () => {
		expect(isValidUsername('maria@silva').valid).toBe(false);
	});

	it('rejeita muito curto (2 chars)', () => {
		expect(isValidUsername('ab').valid).toBe(false);
	});

	it('rejeita muito longo (> 30 chars)', () => {
		expect(isValidUsername('a'.repeat(31)).valid).toBe(false);
	});
});

describe('isValidContent (R-08)', () => {
	it('rejeita conteúdo menor que 10 chars', () => {
		expect(isValidContent('curto').valid).toBe(false);
	});

	it('aceita conteúdo com exatamente 10 chars', () => {
		expect(isValidContent('1234567890').valid).toBe(true);
	});

	it('aceita conteúdo com exatamente 5000 chars (limite máximo)', () => {
		expect(isValidContent('a'.repeat(CONTENT_MAX)).valid).toBe(true);
	});

	it('rejeita conteúdo com 5001 chars (acima do máximo)', () => {
		expect(isValidContent('a'.repeat(CONTENT_MAX + 1)).valid).toBe(false);
	});

	it('rejeita vazio/null', () => {
		expect(isValidContent('').valid).toBe(false);
		expect(isValidContent(null).valid).toBe(false);
	});
});

describe('sanitizeText (R-07)', () => {
	it('escapa tag <script>', () => {
		const out = sanitizeText('<script>alert(1)</script>');
		expect(out).not.toContain('<script>');
		expect(out).toContain('&lt;script&gt;');
	});

	it('escapa aspas', () => {
		expect(sanitizeText('"hello"')).toContain('&quot;');
	});

	it('retorna string vazia para null/undefined', () => {
		expect(sanitizeText(null)).toBe('');
		expect(sanitizeText(undefined)).toBe('');
	});

	it('preserva texto normal', () => {
		const texto = 'Ótima dica de sustentabilidade';
		expect(sanitizeText(texto)).toBe(texto);
	});
});
