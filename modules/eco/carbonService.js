/**
 * carbonService.js
 * Integração com API externa de pegada de carbono.
 * Em produção, usa a Climatiq API (https://climatiq.io).
 * Em testes, as chamadas HTTP são interceptadas pelo nock.
 */
import axios from 'axios';

export const ECO_API_BASE = process.env.ECO_API_URL || 'https://api.climatiq.io';

const http = axios.create({
	baseURL: ECO_API_BASE,
	timeout: 8000,
	headers: {
		Authorization: `Bearer ${process.env.ECO_API_KEY || 'test-key'}`,
		'Content-Type': 'application/json'
	}
});

/**
 * Estima a emissão de CO₂ para uma atividade (ex: viagem de carro).
 */
export async function estimateCarbonFootprint(activityId, distanceKm) {
	if (!activityId || distanceKm == null) {
		return { ok: false, error: 'Atividade e distância são obrigatórios.' };
	}
	if (distanceKm < 0) {
		return { ok: false, error: 'Distância não pode ser negativa.' };
	}

	const response = await http.post('/estimate', {
		emission_factor: { activity_id: activityId },
		parameters: { distance: distanceKm, distance_unit: 'km' }
	});

	return { ok: true, data: response.data };
}

/**
 * Busca dicas de sustentabilidade de uma categoria (ex: 'energia', 'transporte').
 */
export async function fetchEcoTips(category = 'geral', limit = 5) {
	const response = await http.get('/tips', {
		params: { category, limit }
	});
	return { ok: true, tips: response.data.tips || [] };
}

/**
 * Retorna o índice de sustentabilidade de uma região.
 */
export async function getSustainabilityIndex(region) {
	if (!region) return { ok: false, error: 'Região é obrigatória.' };

	const response = await http.get(`/sustainability-index/${region}`);
	return { ok: true, index: response.data };
}
