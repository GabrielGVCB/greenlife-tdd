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
				'modules/user/userController.js',
				'modules/action/actionService.js',
				'modules/action/actionController.js',
				'middlewares/validators.js',
				'middlewares/adminAuth.js'
			],
			exclude: [
				'src/config/**',
				'src/middlewares/**',
				'src/server.js',
				'src/app.js',
				'config/**',
				'**/node_modules/**',
				'tests/**',
				'**/*Model.js'
			],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		}
	}
});
