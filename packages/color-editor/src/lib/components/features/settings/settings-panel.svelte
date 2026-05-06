<script lang="ts">
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import {
		SegmentedControl,
		SegmentedControlItem
	} from '@matchalatte/ssp-ui/components/segmented-control';
	import { m } from '$lib/paraglide/messages';
	import { getLocale, setLocale } from '$lib/paraglide/runtime';
	import { themeState } from '$lib/stores/theme.svelte';
	import { outputGamutState, type OutputGamut } from '$lib/stores/output-gamut.svelte';

	let localeValue = $state(getLocale());
	const localeLabel = $derived(
		localeValue === 'en' ? m.settings_language_en() : m.settings_language_ja()
	);

	$effect(() => {
		if (localeValue !== getLocale()) {
			setLocale(localeValue);
		}
	});

	function handleThemeChange(id: string) {
		themeState.setTheme(id as 'light' | 'dark' | 'system');
	}

	function handleGamutChange(id: string) {
		outputGamutState.setId(id as OutputGamut);
	}
</script>

<div class="settings-page">
	<h1>{m.settings_title()}</h1>

	<!-- Language -->
	<section class="settings-section">
		<h2>{m.settings_language()}</h2>
		<Picker bind:selectedKey={localeValue} label={localeLabel} selectionMode="single">
			<PickerTrigger />
			<PickerContent>
				<PickerItem value="en" label={m.settings_language_en()} />
				<PickerItem value="ja" label={m.settings_language_ja()} />
			</PickerContent>
		</Picker>
	</section>

	<!-- Theme -->
	<section class="settings-section">
		<h2>{m.settings_theme()}</h2>
		<SegmentedControl selectedKey={themeState.theme} onSelectionChange={handleThemeChange}>
			<SegmentedControlItem id="light">{m.settings_theme_light()}</SegmentedControlItem>
			<SegmentedControlItem id="dark">{m.settings_theme_dark()}</SegmentedControlItem>
			<SegmentedControlItem id="system">{m.settings_theme_system()}</SegmentedControlItem>
		</SegmentedControl>
	</section>

	<!-- Output Gamut -->
	<section class="settings-section">
		<h2>{m.settings_output_gamut()}</h2>
		<SegmentedControl selectedKey={outputGamutState.id} onSelectionChange={handleGamutChange}>
			<SegmentedControlItem id="srgb">{m.settings_gamut_srgb()}</SegmentedControlItem>
			<SegmentedControlItem id="display-p3">{m.settings_gamut_p3()}</SegmentedControlItem>
		</SegmentedControl>
	</section>
</div>

<style>
	.settings-page {
		display: grid;
		gap: var(--space-6);
		max-width: 50ch;
		margin-inline: auto;
		padding-block: var(--space-10);
		padding-inline: var(--space-6);
	}

	h1 {
		font-size: var(--text-400);
		font-weight: 700;
		color: var(--neutral-content-color-default);
		margin: 0;
	}

	h2 {
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
	}

	.settings-section {
		display: grid;
		gap: var(--space-3);
	}
</style>
