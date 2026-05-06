import { sveltekit } from '@sveltejs/kit/vite';
import { spectrumThemePlugin } from '@ssp/core';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), spectrumThemePlugin()]
});
