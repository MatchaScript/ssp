import type { ColorEntry, SpectrumConfig } from '$lib/types/spectrum-config';
import defaultConfig from '../../../spectrum.config.json';

const STORAGE_KEY = 'spectrum-config';
const DEFAULT_BASE_HEX = '#808080';

function serialize(config: SpectrumConfig): string {
	return JSON.stringify(config, null, '\t');
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Whether a parsed value carries everything palette generation reads.
 *
 * The JSON editor applies on every keystroke, so half-finished edits reach here
 * as syntactically valid JSON. Without this check a config missing `gray` is
 * stored and every page that reads it throws on the next render.
 */
export function isSpectrumConfig(value: unknown): value is SpectrumConfig {
	if (!isRecord(value)) return false;

	if (!isRecord(value.colors)) return false;
	if (!Object.values(value.colors).every((c) => isRecord(c) && typeof c.baseHex === 'string')) {
		return false;
	}

	if (!Array.isArray(value.levels) || !Array.isArray(value.grayLevels)) return false;
	if (!Array.isArray(value.colorContrastTargets)) return false;

	if (!isRecord(value.gray) || !isRecord(value.gray.contrastTargets)) return false;
	if (!isRecord(value.themes)) return false;

	return true;
}

function loadFromStorage(): SpectrumConfig {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed: unknown = JSON.parse(stored);
			if (isSpectrumConfig(parsed)) return parsed;
		}
	} catch {
		// Corrupted data — fall through to default
	}
	return defaultConfig as SpectrumConfig;
}

/**
 * Browser-side config state.
 *
 * Holds the full spectrum.config.json as a raw object. `colors` and
 * `accentColor` are derived for UI consumption; the JSON editor reads and
 * writes the raw object directly.
 */
class ConfigState {
	raw = $state<SpectrumConfig>(loadFromStorage());

	/** Serialization of the last persisted state, for the dirty check. */
	private savedJson = $state<string>('');

	constructor() {
		this.savedJson = serialize(this.raw);
	}

	json = $derived(serialize(this.raw));

	/** Whether there are edits that `save()` has not yet written. */
	dirty = $derived(this.json !== this.savedJson);

	/** Persist current config to localStorage. */
	save() {
		const json = this.json;
		localStorage.setItem(STORAGE_KEY, json);
		this.savedJson = json;
	}

	/** Reset to the bundled default config and clear localStorage. */
	reset() {
		localStorage.removeItem(STORAGE_KEY);
		this.raw = defaultConfig as SpectrumConfig;
		this.savedJson = serialize(this.raw);
	}

	colors = $derived.by<ColorEntry[]>(() => {
		const { colors } = this.raw;
		if (!colors) return [];
		return Object.entries(colors).map(([name, value]) => ({
			name,
			baseHex: value.baseHex,
			scaleAnchors: value.scaleAnchors ?? {}
		}));
	});

	accentColor = $derived<string>(this.raw.accentColor ?? 'blue');

	/** Replace the whole config. Returns false — leaving state untouched — if
	 *  the JSON does not parse or is missing keys palette generation needs. */
	updateFromJSON(json: string): boolean {
		let parsed: unknown;
		try {
			parsed = JSON.parse(json);
		} catch {
			return false;
		}
		if (!isSpectrumConfig(parsed)) return false;

		this.raw = parsed;
		return true;
	}

	// ── Colors ──

	/** Add a color under an unused name derived from `base`; returns the name used. */
	addColor(base = 'new-color'): string {
		let name = base;
		for (let n = 2; name in this.raw.colors; n++) name = `${base}-${n}`;

		this.raw.colors[name] = { baseHex: DEFAULT_BASE_HEX, scaleAnchors: {} };
		return name;
	}

	removeColor(name: string) {
		delete this.raw.colors[name];

		if (this.raw.accentColor === name) {
			this.raw.accentColor = Object.keys(this.raw.colors)[0];
		}
	}

	/** Rename a color. Returns false if `newName` is already taken, so that
	 *  renaming can never silently discard the color it collided with. */
	renameColor(oldName: string, newName: string): boolean {
		if (newName in this.raw.colors) return false;

		const snapshot = $state.snapshot(this.raw.colors[oldName]);
		delete this.raw.colors[oldName];
		this.raw.colors[newName] = snapshot;

		if (this.raw.accentColor === oldName) {
			this.raw.accentColor = newName;
		}
		return true;
	}

	updateColorBaseHex(name: string, hex: string) {
		this.raw.colors[name].baseHex = hex;
	}

	// ── Scale anchors ──

	/** Anchor map for a color, created on demand — the config may omit it. */
	private anchorsOf(name: string): Record<string, string> {
		const color = this.raw.colors[name];
		return (color.scaleAnchors ??= {});
	}

	setColorAnchor(name: string, level: string, hex: string) {
		this.anchorsOf(name)[level] = hex;
	}

	removeColorAnchor(name: string, level: string) {
		delete this.anchorsOf(name)[level];
	}

	// ── Contrast targets ──

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
}

export const configState = new ConfigState();
