import { sveltekit } from '@sveltejs/kit/vite';
import { spectrumThemePlugin } from '@matchalatte/ssp-core';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), spectrumThemePlugin()]
});
