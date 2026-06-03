import { vi, afterEach } from 'vitest';

// Restaura todos os spies após cada teste
afterEach(() => {
	vi.restoreAllMocks();
});
