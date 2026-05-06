import 'virtual:ssp/theme.css';
import './demo.css';
import type { Preview } from '@storybook/sveltekit';

const preview: Preview = {
	parameters: {
		backgrounds: { disable: true },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		viewport: {
			defaultViewport: 'reset'
		}
	},
	globalTypes: {
		theme: {
			description: 'Global theme for components',
			defaultValue: 'light',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' }
				],
				dynamicTitle: true
			}
		}
	},
	decorators: [
		(story, context) => {
			const theme = context.globals.theme;
			if (typeof document !== 'undefined') {
				document.documentElement.setAttribute('data-theme', theme);
			}
			return story();
		}
	]
};

export default preview;
