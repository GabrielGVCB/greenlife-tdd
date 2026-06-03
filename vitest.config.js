import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		resetMocks: true,
		setupFiles: ['./tests/setup.js'],
		include: ['tests/**/*.test.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			include: [
				'modules/user/userService.js',
				'middlewares/validators.js',
				'middlewares/adminAuth.js'
			],
			exclude: ['**/*Model.js', '**/node_modules/**', 'tests/**'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	}
});
