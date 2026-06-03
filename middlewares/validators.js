const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
	if (!email || typeof email !== 'string') {
		return { valid: false, message: 'E-mail é obrigatório.' };
	}
	if (!EMAIL_REGEX.test(email.trim())) {
		return { valid: false, message: 'Formato de e-mail inválido.' };
	}
	return { valid: true, message: '' };
}

export function isValidPassword(password) {
	if (!password || typeof password !== 'string') {
		return { valid: false, message: 'Senha é obrigatória.' };
	}
	if (password.length < 8) {
		return { valid: false, message: 'Senha deve ter no mínimo 8 caracteres.' };
	}
	return { valid: true, message: '' };
}

export function isValidUsername(username) {
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

export const CONTENT_MIN = 10;
export const CONTENT_MAX = 5000;

export function isValidContent(content) {
	if (!content || typeof content !== 'string') {
		return { valid: false, message: 'Conteúdo é obrigatório.' };
	}
	const len = content.trim().length;
	if (len < CONTENT_MIN) {
		return { valid: false, message: `Conteúdo deve ter no mínimo ${CONTENT_MIN} caracteres.` };
	}
	if (len > CONTENT_MAX) {
		return { valid: false, message: `Conteúdo deve ter no máximo ${CONTENT_MAX} caracteres.` };
	}
	return { valid: true, message: '' };
}

export function sanitizeText(text) {
	if (!text || typeof text !== 'string') return '';
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

export { EMAIL_REGEX };
