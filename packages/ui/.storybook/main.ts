import type { StorybookConfig } from '@storybook/sveltekit';
import { spectrumThemePlugin } from '@ssp/core';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-svelte-csf'],
	framework: '@storybook/sveltekit',
	viteFinal: async (config) => {
		return mergeConfig(config, {
			plugins: [spectrumThemePlugin()]
		});
	}
};

export default config;
