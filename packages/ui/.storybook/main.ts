import type { StorybookConfig } from '@storybook/sveltekit';
import { spectrumThemePlugin } from '@matchalatte/ssp-theme';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: [
		'@storybook/addon-svelte-csf',
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs'
	],
	framework: '@storybook/sveltekit',
	viteFinal: async (config) => {
		return mergeConfig(config, {
			plugins: [spectrumThemePlugin()]
		});
	}
};

export default config;
