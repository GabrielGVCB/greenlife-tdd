/**
 * Validadores puros — funções sem efeitos colaterais para facilitar testes unitários.
 *
 * Cada função retorna { valid: boolean, message: string }
 * para padronizar o uso nos controllers e nos testes.
 *
 * Cobre Riscos:
 *  - R-04: E-mail inválido no cadastro
 *  - R-11: Senha curta no cadastro
 *  - R-08: Conteúdo de dica/post acima do limite de tamanho
 */

// Regex pragmático para e-mail (RFC simplificada)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Valida formato de e-mail.
 * Cobre R-04.
 */
function isValidEmail(email) {
	if (!email || typeof email !== 'string') {
		return { valid: false, message: 'E-mail é obrigatório.' };
	}
	if (!EMAIL_REGEX.test(email.trim())) {
		return { valid: false, message: 'Formato de e-mail inválido.' };
	}
	return { valid: true, message: '' };
}

/**
 * Valida força mínima de senha (mínimo 8 caracteres).
 * Cobre R-11.
 */
function isValidPassword(password) {
	if (!password || typeof password !== 'string') {
		return { valid: false, message: 'Senha é obrigatória.' };
	}
	if (password.length < 8) {
		return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres.' };
	}
	return { valid: true, message: '' };
}

/**
 * Valida nome de usuário (3 a 30 caracteres alfanuméricos + underscore).
 */
function isValidUsername(username) {
	if (!username || typeof username !== 'string') {
		return { valid: false, message: 'Nome de usuário é obrigatório.' };
	}
	const trimmed = username.trim();
	if (trimmed.length < 3 || trimmed.length > 30) {
		return { valid: false, message: 'Nome de usuário deve ter entre 3 e 30 caracteres.' };
	}
	if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
		return {
			valid: false,
			message: 'Nome de usuário só pode conter letras, números e underscore.'
		};
	}
	return { valid: true, message: '' };
}

/**
 * Valida tamanho do conteúdo (texto) de uma dica ou post.
 * Regra: entre 10 e 5000 caracteres.
 * Cobre R-08 (adaptado do "vídeo > 60s" para "texto > limite").
 */
const CONTENT_MIN = 10;
const CONTENT_MAX = 5000;

function isValidContent(content) {
	if (!content || typeof content !== 'string') {
		return { valid: false, message: 'Conteúdo é obrigatório.' };
	}
	const len = content.trim().length;
	if (len < CONTENT_MIN) {
		return {
			valid: false,
			message: `Conteúdo deve ter no mínimo ${CONTENT_MIN} caracteres.`
		};
	}
	if (len > CONTENT_MAX) {
		return {
			valid: false,
			message: `Conteúdo deve ter no máximo ${CONTENT_MAX} caracteres.`
		};
	}
	return { valid: true, message: '' };
}

/**
 * Sanitiza texto removendo tags HTML perigosas para prevenir XSS.
 * Como reforço, mas a defesa principal é o uso de <%= %> (escape) no EJS.
 *
 * Cobre R-07 (XSS em comentários).
 */
function sanitizeText(text) {
	if (!text || typeof text !== 'string') return '';
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

module.exports = {
	isValidEmail,
	isValidPassword,
	isValidUsername,
	isValidContent,
	sanitizeText,
	EMAIL_REGEX,
	CONTENT_MIN,
	CONTENT_MAX
};
