import { getContext, setContext } from 'svelte';
import type { ChannelDef } from '$lib/types/color-space';

export interface ColorDot {
	hex: string;
	name: string;
}

export interface ScalePathEntry {
	name: string;
	swatches: string[];
	variant?: 'default' | 'adobe' | 'helmlab';
}

export interface ChannelSeries {
	name: string;
	color: string;
	points: { index: number; value: number }[];
	variant?: 'default' | 'adobe' | 'helmlab';
}

export interface ColorEditorContext {
	readonly colorName: string;
	readonly sortedAnchors: [string, string][];
	readonly previewSwatches: string[];
	readonly adobeSwatches: string[];
	readonly helmlabSwatches: string[];
	readonly showOwn: boolean;
	readonly showAdobe: boolean;
	readonly showHelmlab: boolean;
	readonly adobeRefColor: string;
	readonly gradientCss: string;
	readonly wheelDots: ColorDot[];
	readonly wheelPaths: ScalePathEntry[];
	readonly channelData: [ChannelSeries[], ChannelSeries[], ChannelSeries[]];
	readonly channels: [ChannelDef, ChannelDef, ChannelDef];
	readonly levelCount: number;
	readonly colorSpaceLabel: string;
}

const KEY = Symbol('color-editor');

export function setColorEditorContext(ctx: ColorEditorContext) {
	setContext(KEY, ctx);
}

export function getColorEditorContext(): ColorEditorContext {
	return getContext<ColorEditorContext>(KEY);
}
