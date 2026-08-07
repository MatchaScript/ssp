import { browser } from '$app/environment';

export type DotMode = 'keyColors' | 'crossSection';

const STORAGE_KEY = 'wheel-settings';

interface Preferences {
	dotMode: DotMode;
	showPaths: boolean;
	showHarmonyLines: boolean;
	showGamutBoundary: boolean;
	snapLightness: boolean;
}

const DEFAULTS: Preferences = {
	dotMode: 'keyColors',
	showPaths: true,
	showHarmonyLines: false,
	showGamutBoundary: false,
	snapLightness: true
};

function loadPreferences(): Preferences {
	let stored: Partial<Preferences>;
	try {
		stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		// Corrupted data — fall through to defaults
		return { ...DEFAULTS };
	}

	return {
		dotMode: stored.dotMode === 'crossSection' ? 'crossSection' : DEFAULTS.dotMode,
		showPaths: typeof stored.showPaths === 'boolean' ? stored.showPaths : DEFAULTS.showPaths,
		showHarmonyLines:
			typeof stored.showHarmonyLines === 'boolean'
				? stored.showHarmonyLines
				: DEFAULTS.showHarmonyLines,
		showGamutBoundary:
			typeof stored.showGamutBoundary === 'boolean'
				? stored.showGamutBoundary
				: DEFAULTS.showGamutBoundary,
		snapLightness:
			typeof stored.snapLightness === 'boolean' ? stored.snapLightness : DEFAULTS.snapLightness
	};
}

/**
 * Shared color-wheel view settings.
 *
 * Every wheel in the app reads these, so toggling an overlay on one page keeps
 * it on when you navigate to another. Preferences persist; `lightness` does not
 * — it points at whichever scale level is being inspected right now.
 */
class WheelSettingsState {
	dotMode = $state<DotMode>(DEFAULTS.dotMode);
	showPaths = $state(DEFAULTS.showPaths);
	showHarmonyLines = $state(DEFAULTS.showHarmonyLines);
	showGamutBoundary = $state(DEFAULTS.showGamutBoundary);
	snapLightness = $state(DEFAULTS.snapLightness);
	lightness = $state(70);

	constructor() {
		if (!browser) return;

		Object.assign(this, loadPreferences());

		$effect.root(() => {
			$effect(() => {
				const preferences: Preferences = {
					dotMode: this.dotMode,
					showPaths: this.showPaths,
					showHarmonyLines: this.showHarmonyLines,
					showGamutBoundary: this.showGamutBoundary,
					snapLightness: this.snapLightness
				};
				localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
			});
		});
	}
}

export const wheelSettings = new WheelSettingsState();
