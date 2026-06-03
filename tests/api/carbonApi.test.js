/**
 * Testes de API — carbonService (integração com API externa)
 *
 * Usa nock para interceptar chamadas HTTP reais → testes rápidos e sem rede.
 * Simula a API Climatiq (https://api.climatiq.io) de pegada de carbono.
 *
 * Cobre:
 *  - Chamada HTTP POST /estimate → cálculo de CO₂
 *  - Chamada HTTP GET /tips → dicas de sustentabilidade
 *  - Chamada HTTP GET /sustainability-index/:region
 *  - Cenários de sucesso e falha (400, 401, 500)
 *  - Validação de parâmetros antes da chamada HTTP
 */
import nock from 'nock';
import {
	estimateCarbonFootprint,
	fetchEcoTips,
	getSustainabilityIndex,
	ECO_API_BASE
} from '../../modules/eco/carbonService.js';

afterEach(() => {
	nock.cleanAll();
});

// ─── estimateCarbonFootprint ─────────────────────────────────────────────────

describe('carbonService.estimateCarbonFootprint', () => {
	it('retorna dados de CO₂ quando a API responde com sucesso', async () => {
		nock(ECO_API_BASE)
			.post('/estimate')
			.reply(200, {
				co2e: 12.5,
				co2e_unit: 'kg',
				emission_factor: { activity_id: 'car_average_medium_car_2020' }
			});

		const result = await estimateCarbonFootprint('car_average_medium_car_2020', 100);

		expect(result.ok).toBe(true);
		expect(result.data.co2e).toBe(12.5);
		expect(result.data.co2e_unit).toBe('kg');
	});

	it('retorna erro de validação quando activityId está ausente', async () => {
		const result = await estimateCarbonFootprint(null, 100);

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/obrigatórios/i);
		expect(nock.pendingMocks()).toHaveLength(0);
	});

	it('retorna erro de validação quando distância é negativa', async () => {
		const result = await estimateCarbonFootprint('car_average', -10);

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/negativa/i);
	});

	it('propaga erro quando a API retorna 401 (chave inválida)', async () => {
		nock(ECO_API_BASE)
			.post('/estimate')
			.reply(401, { error: 'Unauthorized', message: 'Invalid API key' });

		await expect(
			estimateCarbonFootprint('car_average', 50)
		).rejects.toThrow();
	});

	it('propaga erro quando a API retorna 500 (falha interna)', async () => {
		nock(ECO_API_BASE)
			.post('/estimate')
			.reply(500, { error: 'Internal Server Error' });

		await expect(
			estimateCarbonFootprint('car_average', 50)
		).rejects.toThrow();
	});
});

// ─── fetchEcoTips ────────────────────────────────────────────────────────────

describe('carbonService.fetchEcoTips', () => {
	it('retorna lista de dicas quando a API responde com sucesso', async () => {
		nock(ECO_API_BASE)
			.get('/tips')
			.query({ category: 'transporte', limit: 5 })
			.reply(200, {
				tips: [
					{ id: 1, title: 'Use bicicleta', impact: 'alto' },
					{ id: 2, title: 'Carona solidária', impact: 'médio' }
				]
			});

		const result = await fetchEcoTips('transporte', 5);

		expect(result.ok).toBe(true);
		expect(result.tips).toHaveLength(2);
		expect(result.tips[0].title).toBe('Use bicicleta');
	});

	it('retorna lista vazia quando a API não tem dicas para a categoria', async () => {
		nock(ECO_API_BASE)
			.get('/tips')
			.query(true)
			.reply(200, { tips: [] });

		const result = await fetchEcoTips('categoria-inexistente');

		expect(result.ok).toBe(true);
		expect(result.tips).toHaveLength(0);
	});
});

// ─── getSustainabilityIndex ──────────────────────────────────────────────────

describe('carbonService.getSustainabilityIndex', () => {
	it('retorna índice de sustentabilidade para uma região válida', async () => {
		nock(ECO_API_BASE)
			.get('/sustainability-index/BR-SP')
			.reply(200, { region: 'BR-SP', score: 72.4, grade: 'B' });

		const result = await getSustainabilityIndex('BR-SP');

		expect(result.ok).toBe(true);
		expect(result.index.score).toBe(72.4);
		expect(result.index.grade).toBe('B');
	});

	it('retorna erro de validação quando a região está ausente', async () => {
		const result = await getSustainabilityIndex('');

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/obrigatória/i);
	});
});
