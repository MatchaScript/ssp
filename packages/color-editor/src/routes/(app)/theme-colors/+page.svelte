<script lang="ts">
	import { themeColorsState } from '$lib/stores/theme-colors.svelte';
	import { configState } from '$lib/stores/config.svelte';
	import { ThemeColorSwatches } from '$lib/components/features/theme-colors';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import { Slider } from '@matchalatte/ssp-ui/components/slider';
	import { ActionButton } from '@matchalatte/ssp-ui';
	import { Icon } from '@matchalatte/ssp-ui/components/icon';
	import { Settings } from '@matchalatte/ssp-ui/components/icon';
	import { m } from '$lib/paraglide/messages';

	let settingsOpen = $state(false);

	const backgroundChoices = $derived([
		{ value: 'gray', label: 'Gray' },
		...configState.colors.map((c) => ({ value: c.name, label: c.name }))
	]);

	function handlePreviewChange(value: string | string[]) {
		if (typeof value === 'string') {
			themeColorsState.setPreviewTheme(value as 'light' | 'dark');
		}
	}
</script>

<div class="theme-colors-page">
	<div class="page-header">
		<h1 class="page-title">{m.theme_colors_title()}</h1>
		<div class="header-controls">
			<div class="header-picker">
				<Picker
					selectedKey={themeColorsState.previewTheme}
					onSelectionChange={handlePreviewChange}
					label={m.theme_colors_preview()}
					selectionMode="single"
					size="s"
				>
					<PickerTrigger />
					<PickerContent>
						<PickerItem value="light" label="Light" />
						<PickerItem value="dark" label="Dark" />
					</PickerContent>
				</Picker>
			</div>
			<div class="header-picker">
				<Picker
					bind:selectedKey={themeColorsState.contrastFormula}
					label={m.theme_colors_formula()}
					selectionMode="single"
					size="s"
				>
					<PickerTrigger />
					<PickerContent>
						<PickerItem value="wcag2" label="WCAG 2 (Relative Luminance)" />
						<PickerItem value="wcag3" label="APCA (WCAG 3)" />
					</PickerContent>
				</Picker>
			</div>

			<div class="settings-anchor">
				<ActionButton
					isQuiet
					size="s"
					onclick={() => (settingsOpen = !settingsOpen)}
					aria-label={m.theme_colors_settings()}
					title={m.theme_colors_settings()}
				>
					<Icon icon={Settings} />
				</ActionButton>

				{#if settingsOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="settings-backdrop"
						onclick={() => (settingsOpen = false)}
						onkeydown={() => {}}
					></div>
					<div class="settings-panel">
						<h3 class="settings-heading">{m.theme_colors_settings()}</h3>
						<div class="settings-fields">
							<Picker
								bind:selectedKey={themeColorsState.backgroundColorName}
								label={m.theme_colors_background()}
								selectionMode="single"
								size="s"
							>
								<PickerTrigger />
								<PickerContent>
									{#each backgroundChoices as choice (choice.value)}
										<PickerItem value={choice.value} label={choice.label} />
									{/each}
								</PickerContent>
							</Picker>

							<Slider
								bind:value={themeColorsState.lightness}
								min={0}
								max={100}
								label={m.theme_colors_lightness()}
							/>
							<Slider
								bind:value={themeColorsState.contrast}
								min={0.25}
								max={5}
								step={0.01}
								label={m.theme_colors_contrast()}
							/>
							<Slider
								bind:value={themeColorsState.saturation}
								min={0}
								max={100}
								label={m.theme_colors_saturation()}
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="swatches-area" style:background-color={themeColorsState.output.background}>
		{#each themeColorsState.output.colorScales as scale (scale.name)}
			<ThemeColorSwatches
				name={scale.name}
				values={scale.values}
				backgroundLightness={themeColorsState.lightness}
				contrastFormula={themeColorsState.contrastFormula}
			/>
		{/each}
	</div>
</div>

<style>
	.theme-colors-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-300);
		padding: var(--spacing-200) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.page-title {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
	}

	.header-picker {
		width: 10rem;
	}

	/* ── Floating settings panel ── */

	.settings-anchor {
		position: relative;
	}

	.settings-backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
	}

	.settings-panel {
		position: absolute;
		top: calc(100% + var(--spacing-100));
		inset-inline-end: 0;
		z-index: 100;
		width: 18rem;
		padding: var(--spacing-300);
		background-color: var(--background-base-color);
		border: 1px solid var(--gray-200);
		border-radius: var(--corner-radius-medium-default);
		box-shadow: var(--drop-shadow-elevated);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-300);
	}

	.settings-heading {
		margin: 0;
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-content-color-default);
	}

	.settings-fields {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-200);
	}

	/* ── Swatch area ── */

	.swatches-area {
		overflow-y: auto;
		min-height: 0;
		padding: var(--spacing-400);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-400);
		transition: background-color 200ms ease;
	}
</style>
