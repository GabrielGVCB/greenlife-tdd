import request from 'supertest';
import app from '../../app.js';

describe('GET /health', () => {
	it('retorna 200 com status true, message ok e timestamp válido', async () => {
		const res = await request(app).get('/health');

		expect(res.status).toBe(200);
		expect(res.body.status).toBe(true);
		expect(res.body.message).toBe('ok');
		expect(typeof res.body.timestamp).toBe('string');
		expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
	});
});
