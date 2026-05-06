import type { ColorEntry, SpectrumConfig } from '$lib/types/spectrum-config';
import defaultConfig from '../../../spectrum.config.json';

const STORAGE_KEY = 'spectrum-config';

function loadFromStorage(): SpectrumConfig {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) return JSON.parse(stored);
	} catch {
		// Corrupted data — fall through to default
	}
	return defaultConfig as SpectrumConfig;
}

/**
 * Browser-side config state.
 *
 * Holds the full spectrum.config.json as a raw object.
 * `colors` and `accentColor` are derived for UI consumption.
 * The JSON editor reads/writes the raw object directly.
 */
class ConfigState {
	raw = $state<SpectrumConfig>(loadFromStorage());

	/** Persist current config to localStorage. */
	save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.raw));
	}

	/** Reset to the bundled default config and clear localStorage. */
	reset() {
		localStorage.removeItem(STORAGE_KEY);
		this.raw = defaultConfig as SpectrumConfig;
	}

	colors = $derived.by<ColorEntry[]>(() => {
		const { colors } = this.raw;
		if (!colors) return [];
		return Object.entries(colors).map(([name, value]) => ({
			name,
			baseHex: value.baseHex,
			scaleAnchors: value.scaleAnchors
		}));
	});

	accentColor = $derived<string>(this.raw.accentColor ?? 'blue');

	json = $derived(JSON.stringify(this.raw, null, '\t'));

	updateFromJSON(json: string) {
		this.raw = JSON.parse(json);
	}

	updateColorBaseHex(name: string, hex: string) {
		this.raw.colors[name].baseHex = hex;
	}

	updateColorAnchor(name: string, level: string, hex: string) {
		this.raw.colors[name].scaleAnchors[level] = hex;
	}

	addColorAnchor(name: string, level: string, hex: string) {
		this.raw.colors[name].scaleAnchors[level] = hex;
	}

	setColorAnchors(name: string, anchors: Record<string, string>) {
		this.raw.colors[name].scaleAnchors = anchors;
	}

	removeColorAnchor(name: string, level: string) {
		delete this.raw.colors[name].scaleAnchors[level];
	}

	updateContrastTarget(index: number, value: number) {
		this.raw.colorContrastTargets[index] = value;
	}

	addContrastTarget(value: number) {
		this.raw.colorContrastTargets = [...this.raw.colorContrastTargets, value];
	}

	removeContrastTarget(index: number) {
		this.raw.colorContrastTargets = this.raw.colorContrastTargets.filter((_, i) => i !== index);
	}

	sortContrastTargets() {
		this.raw.colorContrastTargets = [...this.raw.colorContrastTargets].sort((a, b) => a - b);
	}

	setContrastTargets(targets: number[]) {
		this.raw.colorContrastTargets = targets;
	}

	renameColor(oldName: string, newName: string) {
		const snapshot = $state.snapshot(this.raw.colors[oldName]);
		delete this.raw.colors[oldName];
		this.raw.colors[newName] = snapshot;
		if (this.raw.accentColor === oldName) {
			this.raw.accentColor = newName;
		}
	}
}

export const configState = new ConfigState();
