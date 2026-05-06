import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/index.ts'],
	format: 'esm',
	dts: true,
	external: ['vite', '@adobe/leonardo-contrast-colors', '@adobe/spectrum-tokens', 'culori']
});
