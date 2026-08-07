export type {
	ColorConfig,
	ColorFormat,
	GrayConfig,
	SpectrumConfig
} from '@matchalatte/ssp-theme/generate';

/**
 * A config color paired with the key it is stored under.
 *
 * `scaleAnchors` is optional in the config but always present here — the store
 * normalises it so list and wheel code never has to special-case its absence.
 */
export interface ColorEntry {
	name: string;
	baseHex: string;
	scaleAnchors: Record<string, string>;
}
