import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

const MEDIA = '(prefers-color-scheme: dark)';
const STORAGE_KEY = 'theme';
const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system'];

function isValidTheme(value: unknown): value is Theme {
	return typeof value === 'string' && VALID_THEMES.includes(value as Theme);
}

/**
 * Shared theme state.
 *
 * Reads/writes `localStorage` directly — no server dependency.
 * The inline script in `app.html` applies the initial theme before paint (FOUC prevention),
 * and this store keeps the reactive state in sync for the settings UI.
 *
 * - `theme`         — the user's preference: 'light' | 'dark' | 'system'
 * - `resolvedTheme` — what is actually applied: 'light' | 'dark'
 * - `systemTheme`   — current OS preference: 'light' | 'dark'
 */
class ThemeState {
	theme = $state<Theme>('system');
	systemTheme = $state<'light' | 'dark'>('light');
	resolvedTheme = $derived<'light' | 'dark'>(
		this.theme === 'system' ? this.systemTheme : this.theme
	);

	constructor() {
		if (browser) {
			this.systemTheme = window.matchMedia(MEDIA).matches ? 'dark' : 'light';
		}
	}

	setTheme(value: Theme) {
		this.theme = value;

		if (browser) {
			localStorage.setItem(STORAGE_KEY, value);

			const resolved = value === 'system' ? this.systemTheme : value;
			document.documentElement.setAttribute('data-theme', resolved);
			document.documentElement.style.setProperty('color-scheme', resolved);
		}
	}

	/**
	 * Initialise from localStorage and set up the media query listener.
	 * Must be called inside a component context (e.g. root layout).
	 * Returns a cleanup function.
	 */
	init(): () => void {
		if (!browser) return () => {};

		const stored = localStorage.getItem(STORAGE_KEY);
		this.theme = isValidTheme(stored) ? stored : 'system';

		const mql = window.matchMedia(MEDIA);
		this.systemTheme = mql.matches ? 'dark' : 'light';

		const handler = (e: MediaQueryListEvent) => {
			this.systemTheme = e.matches ? 'dark' : 'light';

			if (this.theme === 'system') {
				const resolved = e.matches ? 'dark' : 'light';
				document.documentElement.setAttribute('data-theme', resolved);
				document.documentElement.style.setProperty('color-scheme', resolved);
			}
		};
		mql.addEventListener('change', handler);

		return () => mql.removeEventListener('change', handler);
	}
}

export const themeState = new ThemeState();
