<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { configState } from '$lib/stores/config.svelte';
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { Theme, Color, BackgroundColor } from '@adobe/leonardo-contrast-colors';
	import { buildColorKeys } from '$lib/utils/color-keys';
	import { ColorPicker } from '@matchalatte/ssp-ui/components/color-picker';
	import { TextField } from '@matchalatte/ssp-ui/components/textfield';
	import { ActionButton } from '@matchalatte/ssp-ui';
	import { Icon } from '@matchalatte/ssp-ui/components/icon';
	import { Trash2 } from '@matchalatte/ssp-ui/components/icon';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import { Switch } from '@matchalatte/ssp-ui/components/switch';
	import { m } from '$lib/paraglide/messages';
	import adobePalette from '$lib/data/adobe-spectrum-palette.json';
	import { COLOR_SPACES } from '$lib/types/color-space';
	import { wheelLightnessStore } from '$lib/stores/wheel-lightness.svelte';
	import { setColorEditorContext, type ChannelSeries } from '$lib/contexts/color-editor';
	import type { CssColor } from '@adobe/leonardo-contrast-colors';

	let { children } = $props();

	const bg = new BackgroundColor({
		name: 'bg',
		colorKeys: ['#888888' as CssColor],
		colorSpace: 'OKLCH',
		ratios: [1]
	});

	type AdobePalette = Record<string, Record<string, { light: string; dark: string }>>;
	const adobeColors = Object.keys(adobePalette as AdobePalette).sort();

	// ── Color data from config ──

	const colorName = $derived(page.params.color ?? '');
	const colorData = $derived(configState.raw.colors[colorName]);

	const sortedAnchors = $derived.by(() => {
		if (!colorData) return [];
		return Object.entries(colorData.scaleAnchors).sort(([a], [b]) => Number(a) - Number(b));
	});

	const usedLevels = $derived(new Set(sortedAnchors.map(([level]) => level)));

	// ── Preview: Leonardo theme-based generation ──

	const contrastTargets = $derived(configState.raw.colorContrastTargets);
	const previewLightness = $derived(configState.raw.themes.light.lightness);

	const previewSwatches = $derived.by<string[]>(() => {
		if (!colorData || sortedAnchors.length === 0 || !contrastTargets?.length) return [];

		const colorHue = new Color({
			name: colorName,
			colorKeys: buildColorKeys(colorData),
			colorSpace: 'CAM02',
			ratios: [...contrastTargets]
		});
		const theme = new Theme({
			colors: [bg, colorHue],
			backgroundColor: bg,
			lightness: previewLightness,
			output: 'HEX',
			formula: 'wcag2'
		});

		const [, ...colorEntries] = theme.contrastColors;
		const entry = colorEntries.find((c) => c.name === colorName);
		if (!entry) return [];
		return entry.values.map((v) => v.value);
	});

	const gradientCss = $derived(
		previewSwatches.length > 0 ? `linear-gradient(to right, ${previewSwatches.join(', ')})` : 'none'
	);

	// ── Scale visibility toggles ──

	let showOwn = $state(true);
	let showAdobe = $state(false);

	// ── Adobe reference ──

	let adobeRefColor = $state('');

	$effect(() => {
		const name = colorName.toLowerCase();
		if (name in (adobePalette as AdobePalette)) {
			adobeRefColor = name;
		}
	});

	const adobeSwatches = $derived.by<string[]>(() => {
		if (!adobeRefColor) return [];
		const levels = (adobePalette as AdobePalette)[adobeRefColor];
		if (!levels) return [];
		return Object.keys(levels)
			.sort((a, b) => Number(a) - Number(b))
			.map((l) => levels[l].light);
	});

	const levelCount = $derived(contrastTargets?.length ?? 16);

	// ── Color wheel + charts ──

	const spaceConfig = $derived(COLOR_SPACES[colorSpaceState.id]);
	const channels = $derived(spaceConfig.channels);
	const colorSpaceLabel = $derived(spaceConfig.label);

	const wheelDots = $derived.by(() => {
		if (!showOwn || !colorData) return [];
		const dots = [{ hex: colorData.baseHex, name: `${colorName}-base` }];
		for (const [level, hex] of Object.entries(colorData.scaleAnchors)) {
			dots.push({ hex, name: `${colorName}-${level}` });
		}
		return dots;
	});

	const wheelPaths = $derived.by(() => {
		const result: {
			name: string;
			swatches: string[];
			variant?: 'default' | 'adobe';
		}[] = [];
		if (showOwn && previewSwatches.length > 0) {
			result.push({ name: colorName, swatches: previewSwatches });
		}
		if (showAdobe && adobeSwatches.length > 0) {
			result.push({ name: `${adobeRefColor}-adobe`, swatches: adobeSwatches, variant: 'adobe' });
		}
		return result;
	});

	interface ValuePoint {
		index: number;
		value: number;
	}

	function extractChannelSeries(
		swatches: string[],
		name: string,
		color: string,
		opts: { variant?: 'default' | 'adobe'; indexCount?: number } = {}
	): [ChannelSeries, ChannelSeries, ChannelSeries] {
		const extract = spaceConfig.extract;
		const pts0: ValuePoint[] = [];
		const pts1: ValuePoint[] = [];
		const pts2: ValuePoint[] = [];
		const total = opts.indexCount ?? swatches.length;

		for (let i = 0; i < swatches.length; i++) {
			const [c0, c1, c2] = extract(swatches[i]);
			const index = swatches.length === 1 ? 1 : 1 + (i / (swatches.length - 1)) * (total - 1);
			pts0.push({ index, value: c0 });
			pts1.push({ index, value: c1 });
			pts2.push({ index, value: c2 });
		}

		return [
			{ name, color, points: pts0, variant: opts.variant },
			{ name, color, points: pts1, variant: opts.variant },
			{ name, color, points: pts2, variant: opts.variant }
		];
	}

	const channelData = $derived.by<[ChannelSeries[], ChannelSeries[], ChannelSeries[]]>(() => {
		const baseHex = colorData?.baseHex ?? '#000';
		const ch: [ChannelSeries[], ChannelSeries[], ChannelSeries[]] = [[], [], []];

		if (showOwn && previewSwatches.length > 0) {
			const s = extractChannelSeries(previewSwatches, colorName, baseHex);
			ch[0].push(s[0]);
			ch[1].push(s[1]);
			ch[2].push(s[2]);
		}
		if (showAdobe && adobeSwatches.length > 0) {
			const s = extractChannelSeries(adobeSwatches, `${adobeRefColor} (Adobe)`, baseHex, {
				variant: 'adobe',
				indexCount: levelCount
			});
			ch[0].push(s[0]);
			ch[1].push(s[1]);
			ch[2].push(s[2]);
		}
		return ch;
	});

	// ── Name editing ──

	let editingName = $derived(page.params.color ?? '');

	function commitRename() {
		const trimmed = editingName.trim();
		if (!trimmed || trimmed === colorName) {
			editingName = colorName;
			return;
		}
		configState.renameColor(colorName, trimmed);
		goto(resolve('/(app)/create/[color]', { color: trimmed }), { replaceState: true });
	}

	function handleNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			(e.target as HTMLInputElement).blur();
		}
	}

	// ── Anchor management ──

	const allLevels = $derived.by(() => {
		const levels = configState.raw.levels as number[] | undefined;
		return levels ? levels.map(String) : [];
	});

	const selectedLevels = $derived(Array.from(usedLevels));

	function handleLevelsChange(newLevels: string[]) {
		if (!colorData) return;
		const newSet = new Set(newLevels);
		for (const level of newLevels) {
			if (!usedLevels.has(level)) {
				configState.addColorAnchor(colorName, level, colorData.baseHex);
			}
		}
		for (const level of usedLevels) {
			if (!newSet.has(level)) {
				configState.removeColorAnchor(colorName, level);
			}
		}
	}

	// ── Anchor click → wheel lightness sync ──

	function handleAnchorClick(hex: string) {
		const wheelSpaceId = COLOR_SPACES[colorSpaceState.id].wheelFallback ?? colorSpaceState.id;
		const wheelSpace = COLOR_SPACES[wheelSpaceId];
		const [, , rawL] = wheelSpace.extract(hex);
		const maxL = wheelSpace.channels[2].max;
		wheelLightnessStore.value = Math.round((rawL / maxL) * 100);
	}

	// ── Tab navigation ──

	const detailHref = $derived(resolve('/(app)/create/[color]', { color: colorName }));
	const summaryHref = $derived(resolve('/(app)/create/[color]/summary', { color: colorName }));
	const isOnSummary = $derived(page.url.pathname.endsWith('/summary'));

	// ── Context ──

	setColorEditorContext({
		get colorName() {
			return colorName;
		},
		get sortedAnchors() {
			return sortedAnchors;
		},
		get previewSwatches() {
			return previewSwatches;
		},
		get adobeSwatches() {
			return adobeSwatches;
		},
		get showOwn() {
			return showOwn;
		},
		get showAdobe() {
			return showAdobe;
		},
		get adobeRefColor() {
			return adobeRefColor;
		},
		get gradientCss() {
			return gradientCss;
		},
		get wheelDots() {
			return wheelDots;
		},
		get wheelPaths() {
			return wheelPaths;
		},
		get channelData() {
			return channelData;
		},
		get channels() {
			return channels;
		},
		get levelCount() {
			return levelCount;
		},
		get colorSpaceLabel() {
			return colorSpaceLabel;
		}
	});
</script>

{#if colorData}
	<div class="color-edit-layout">
		<!-- Left: Edit controls -->
		<div class="edit-panel">
			<!-- Name -->
			<section class="section">
				<h2 class="section-heading">{m.create_name()}</h2>
				<TextField
					bind:value={editingName}
					label={m.create_rename()}
					hideLabel
					size="m"
					onblur={commitRename}
					onkeydown={handleNameKeydown}
				/>
			</section>

			<!-- Base Color -->
			<section class="section">
				<h2 class="section-heading">{m.create_base_color()}</h2>
				<div class="base-color-row">
					<ColorPicker
						value={colorData.baseHex}
						size="l"
						onInput={(hex) => configState.updateColorBaseHex(colorName, hex)}
					/>
					<span class="hex-label">{colorData.baseHex}</span>
				</div>
			</section>

			<!-- Scale Comparison -->
			<section class="section">
				<h2 class="section-heading">{m.create_reference()}</h2>
				<Switch bind:checked={showOwn} size="s">{colorName}</Switch>
				<div class="ref-row">
					<Switch bind:checked={showAdobe} size="s">Adobe</Switch>
					{#if showAdobe}
						<Picker bind:selectedKey={adobeRefColor} selectionMode="single" size="s">
							<PickerTrigger placeholder={m.create_reference_color()} />
							<PickerContent>
								{#each adobeColors as name (name)}
									<PickerItem value={name} label={name} />
								{/each}
							</PickerContent>
						</Picker>
					{/if}
				</div>
			</section>

			<!-- Scale Anchors -->
			<section class="section">
				<div class="section-header">
					<h2 class="section-heading">{m.create_scale_anchors()}</h2>
					<Picker
						selectedKey={selectedLevels}
						selectionMode="multiple"
						size="s"
						onSelectionChange={(v) => handleLevelsChange(v as string[])}
					>
						<PickerTrigger placeholder={m.create_add_anchor()} />
						<PickerContent>
							{#each allLevels as level (level)}
								<PickerItem value={level} label={level} />
							{/each}
						</PickerContent>
					</Picker>
				</div>

				<div class="anchor-list">
					{#each sortedAnchors as [level, hex] (level)}
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div class="anchor-row" onclick={() => handleAnchorClick(hex)}>
							<span class="anchor-level">{level}</span>
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<div onclick={(e: MouseEvent) => e.stopPropagation()}>
								<ColorPicker
									value={hex}
									size="m"
									onInput={(newHex) => configState.updateColorAnchor(colorName, level, newHex)}
								/>
							</div>
							<span class="hex-label">{hex}</span>
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<div onclick={(e: MouseEvent) => e.stopPropagation()}>
								<ActionButton
									isQuiet
									size="s"
									disabled={sortedAnchors.length < 2}
									aria-label={m.create_remove_anchor()}
									title={m.create_remove_anchor()}
									onclick={() => configState.removeColorAnchor(colorName, level)}
								>
									<Icon icon={Trash2} />
								</ActionButton>
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>

		<!-- Right: Tab nav + content -->
		<div class="content-panel">
			<nav class="tab-nav">
				<a class="tab-link" href={detailHref} data-active={!isOnSummary || undefined}>
					{m.create_tab_detail()}
				</a>
				<a class="tab-link" href={summaryHref} data-active={isOnSummary || undefined}>
					{m.create_tab_summary()}
				</a>
			</nav>
			<div class="content-body">
				{@render children()}
			</div>
		</div>
	</div>
{:else}
	<div class="not-found">
		<p class="not-found-text">{m.create_color_not_found()}</p>
	</div>
{/if}

<style>
	.color-edit-layout {
		display: grid;
		grid-template-columns: 17rem 1fr;
		height: 100%;
		min-height: 0;
	}

	/* ── Left: Edit panel ── */

	.edit-panel {
		overflow-y: auto;
		padding: var(--spacing-200);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-500);
		border-right: 1px solid var(--gray-200);
	}

	/* ── Right: Content panel ── */

	.content-panel {
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 0;
	}

	.tab-nav {
		display: flex;
		gap: var(--spacing-100);
		padding: var(--spacing-100) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.tab-link {
		padding: var(--spacing-75) var(--spacing-200);
		font-size: var(--text-100);
		font-weight: 500;
		color: var(--neutral-subdued-content-color-default);
		text-decoration: none;
		border-radius: var(--corner-radius-100);
		transition:
			background-color var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default);
	}

	.tab-link:hover {
		background-color: var(--gray-100);
		color: var(--neutral-content-color-default);
	}

	.tab-link[data-active] {
		color: var(--neutral-content-color-default);
		font-weight: 600;
		background-color: var(--gray-200);
	}

	.content-body {
		overflow-y: auto;
		min-height: 0;
	}

	/* ── Shared ── */

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-200);
	}

	.section-heading {
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	/* ── Base color ── */

	.base-color-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
	}

	.hex-label {
		font-size: var(--text-100);
		font-family: var(--font-mono);
		color: var(--neutral-subdued-content-color-default);
	}

	/* ── Anchor list ── */

	.anchor-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	.anchor-row {
		display: grid;
		grid-template-columns: 2rem auto 1fr auto;
		align-items: center;
		gap: var(--spacing-100);
		padding: var(--spacing-75) var(--spacing-100);
		border-radius: var(--corner-radius-100);
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-default);
	}

	.anchor-row:hover {
		background-color: var(--gray-100);
	}

	.anchor-level {
		font-size: var(--text-75);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--neutral-content-color-default);
		text-align: end;
	}

	/* ── Reference toggles ── */

	.ref-row {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	/* ── Not found ── */

	.not-found {
		display: grid;
		place-items: center;
		height: 100%;
		padding: var(--spacing-400);
	}

	.not-found-text {
		font-size: var(--text-200);
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}

	/* ── Responsive ── */

	@container app (max-width: 960px) {
		.color-edit-layout {
			grid-template-columns: 1fr;
			overflow-y: auto;
		}

		.edit-panel {
			border-right: none;
			border-bottom: 1px solid var(--gray-200);
			overflow-y: visible;
		}

		.content-panel {
			overflow-y: visible;
		}
	}
</style>
