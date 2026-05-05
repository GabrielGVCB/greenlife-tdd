/**
 * Teste de integração: Tabela de Decisão do Controle de Acesso (R-06)
 *
 * Valida as 4 regras da seção 5.4 do Plano de Testes:
 *  R1: autenticado + admin     → 200 (permite)
 *  R2: autenticado + !admin    → 403 (proibido)
 *  R3: !autenticado + admin    → 401/redirect
 *  R4: !autenticado + !admin   → 401/redirect
 */
import { describe, it, expect, vi } from 'vitest';
import adminAuth from '../../middlewares/adminAuth.js';

function mockReq(session = null) {
	return {
		session: session ? { user: session } : {},
		flash: vi.fn()
	};
}

function mockRes() {
	const res = {
		redirect: vi.fn(() => res),
		status: vi.fn(() => res),
		render: vi.fn(() => res)
	};
	return res;
}

describe('adminAuth middleware — Tabela de Decisão (R-06)', () => {
	it('R1: autenticado + role=admin → chama next()', () => {
		const req = mockReq({ id: 1, username: 'admin', role: 'admin' });
		const res = mockRes();
		const next = vi.fn();

		adminAuth(req, res, next);

		expect(next).toHaveBeenCalledOnce();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('R2: autenticado + role=user → HTTP 403', () => {
		const req = mockReq({ id: 2, username: 'maria', role: 'user' });
		const res = mockRes();
		const next = vi.fn();

		adminAuth(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.render).toHaveBeenCalledWith('error', expect.any(Object));
	});

	it('R3: não autenticado (admin hipotético) → HTTP 401 + redirect /login', () => {
		const req = mockReq(null);
		const res = mockRes();
		const next = vi.fn();

		adminAuth(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.redirect).toHaveBeenCalledWith('/login');
	});

	it('R4: não autenticado → HTTP 401 + redirect /login', () => {
		const req = mockReq(null);
		const res = mockRes();
		const next = vi.fn();

		adminAuth(req, res, next);

		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.redirect).toHaveBeenCalledWith('/login');
	});
});
