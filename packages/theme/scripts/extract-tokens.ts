/**
 * Extract semantic tokens from @adobe/spectrum-tokens into a static JSON file.
 *
 * Usage:
 *   node --experimental-strip-types packages/theme/scripts/extract-tokens.ts
 *
 * Output:
 *   packages/theme/src/tokens/semantic.json
 *   packages/theme/src/tokens/palette.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkgRoot = path.dirname(require.resolve('@adobe/spectrum-tokens'));

// ── Load source data ─────────────────────────────────────────────────────────

const variablesJson: Record<string, unknown> = JSON.parse(
	fs.readFileSync(path.join(pkgRoot, 'dist', 'json', 'variables.json'), 'utf8')
);
const paletteJson: Record<string, unknown> = JSON.parse(
	fs.readFileSync(path.join(pkgRoot, 'src', 'color-palette.json'), 'utf8')
);

// ── Semantic token extraction ────────────────────────────────────────────────

// Prefixes matching genSemanticVars + genHueSemanticVars in plugin.ts
const semanticPrefixes = [
	'neutral-',
	'accent-',
	'informative-',
	'negative-',
	'positive-',
	'notice-',
	'disabled-',
	'focus-',
	'drop-shadow-',
	'opacity-',
	'background-',
	'popover-',
	'overlay-'
];

const layoutPrefixes = ['border-width-', 'corner-radius-', 'spacing-', 'space-'];

// Per-hue semantic suffixes (genHueSemanticVars)
const hueSuffixes = [
	'-background-color-default',
	'-subtle-background-color-default',
	'-visual-color'
];

const hueNames = [
	'blue',
	'red',
	'orange',
	'yellow',
	'green',
	'celery',
	'chartreuse',
	'magenta',
	'fuchsia',
	'purple',
	'indigo',
	'seafoam',
	'cyan',
	'gray'
];

interface TokenSetValue {
	value?: string | number;
	ref?: string;
}

interface ShadowColor {
	sets?: { light?: TokenSetValue; dark?: TokenSetValue };
	value?: string;
	ref?: string;
}

interface ShadowLayer {
	x?: string | number;
	y?: string | number;
	offsetX?: string | number;
	offsetY?: string | number;
	blur?: string | number;
	spread?: string | number;
	color?: string | ShadowColor;
}

interface TokenEntry {
	value?: string | number | ShadowLayer[];
	ref?: string;
	sets?: {
		light?: TokenSetValue & { sets?: unknown };
		dark?: TokenSetValue & { sets?: unknown };
		wireframe?: unknown;
	};
}

/**
 * Strip nested sets, uuids, wireframe — keep only the top-level structure
 * that plugin.ts needs: { ref?, value?, sets?: { light: { ref?, value? }, dark: { ref?, value? } } }
 */
function simplifyEntry(entry: TokenEntry): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	if (entry.value !== undefined) {
		if (Array.isArray(entry.value)) {
			// Shadow layers
			result.value = entry.value.map((layer: ShadowLayer) => {
				const simplified: Record<string, unknown> = {};
				for (const prop of ['x', 'y', 'offsetX', 'offsetY', 'blur', 'spread'] as const) {
					if (layer[prop] !== undefined) simplified[prop] = layer[prop];
				}
				if (layer.color !== undefined) {
					if (typeof layer.color === 'string') {
						simplified.color = layer.color;
					} else {
						simplified.color = simplifyShadowColor(layer.color);
					}
				}
				return simplified;
			});
		} else {
			result.value = entry.value;
		}
	}

	if (entry.ref) {
		result.ref = entry.ref;
	}

	if (entry.sets) {
		const sets: Record<string, unknown> = {};
		if (entry.sets.light) {
			sets.light = pickRefOrValue(entry.sets.light);
		}
		if (entry.sets.dark) {
			sets.dark = pickRefOrValue(entry.sets.dark);
		}
		if (Object.keys(sets).length > 0) {
			result.sets = sets;
		}
	}

	return result;
}

function pickRefOrValue(sv: TokenSetValue): Record<string, unknown> {
	const r: Record<string, unknown> = {};
	if (sv.ref !== undefined) r.ref = sv.ref;
	if (sv.value !== undefined) r.value = sv.value;
	return r;
}

function simplifyShadowColor(color: ShadowColor): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	if (color.value) result.value = color.value;
	if (color.ref) result.ref = color.ref;
	if (color.sets) {
		const sets: Record<string, unknown> = {};
		if (color.sets.light) sets.light = pickRefOrValue(color.sets.light);
		if (color.sets.dark) sets.dark = pickRefOrValue(color.sets.dark);
		result.sets = sets;
	}
	return result;
}

// Build the set of hue semantic keys
const hueSemanticKeys = new Set<string>();
for (const hue of hueNames) {
	for (const suffix of hueSuffixes) {
		hueSemanticKeys.add(`${hue}${suffix}`);
	}
}

const semanticTokens: Record<string, unknown> = {};

for (const [key, rawEntry] of Object.entries(variablesJson)) {
	const entry = rawEntry as TokenEntry;

	// Check if this key matches any semantic prefix
	const isSemanticPrefix = semanticPrefixes.some((p) => key.startsWith(p));
	const isLayoutPrefix = layoutPrefixes.some((p) => key.startsWith(p));
	const isHueSemantic = hueSemanticKeys.has(key);

	if (isSemanticPrefix || isLayoutPrefix || isHueSemantic) {
		semanticTokens[key] = simplifyEntry(entry);
	}
}

// ── Palette extraction (transparent scales only) ─────────────────────────────

interface PaletteEntry {
	value?: string;
}

const paletteTokens: Record<string, unknown> = {};

for (const [key, rawEntry] of Object.entries(paletteJson)) {
	if (key.startsWith('transparent-')) {
		const entry = rawEntry as PaletteEntry;
		paletteTokens[key] = { value: entry.value };
	}
}

// ── Write output ─────────────────────────────────────────────────────────────

const outDir = path.resolve(import.meta.dirname, '..', 'src', 'tokens');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
	path.join(outDir, 'semantic.json'),
	JSON.stringify(semanticTokens, null, '\t') + '\n',
	'utf8'
);

fs.writeFileSync(
	path.join(outDir, 'palette.json'),
	JSON.stringify(paletteTokens, null, '\t') + '\n',
	'utf8'
);

const semanticCount = Object.keys(semanticTokens).length;
const paletteCount = Object.keys(paletteTokens).length;
console.log(`Extracted ${semanticCount} semantic tokens → src/tokens/semantic.json`);
console.log(`Extracted ${paletteCount} palette tokens → src/tokens/palette.json`);
