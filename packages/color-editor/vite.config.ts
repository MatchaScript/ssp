import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import { spectrumThemePlugin } from '@ssp/core';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		spectrumThemePlugin(),
		paraglideVitePlugin({ project: './project.inlang', outdir: './src/lib/paraglide' })
	]
});
