<script lang="ts">
	import { ActionButton, Icon, Text } from '@matchalatte/ssp-ui';
	import { Save, Download, Check } from '@matchalatte/ssp-ui/components/icon';
	import {
		Picker,
		PickerTrigger,
		PickerContent,
		PickerItem
	} from '@matchalatte/ssp-ui/components/picker';
	import {
		Dialog,
		DialogContent,
		DialogHeading,
		DialogBody,
		DialogFooter
	} from '@matchalatte/ssp-ui/components/dialog';
	import { configState } from '$lib/stores/config.svelte';
	import { colorSpaceState } from '$lib/stores/color-space.svelte';
	import { downloadSpectrumCss } from '$lib/utils/export-css';
	import { COLOR_SPACES, COLOR_SPACE_IDS, type ColorSpaceId } from '$lib/types/color-space';
	import { m } from '$lib/paraglide/messages';

	let justSaved = $state(false);
	let savedTimer: ReturnType<typeof setTimeout> | undefined;
	let confirmReset = $state(false);

	function handleSave() {
		configState.save();
		justSaved = true;
		clearTimeout(savedTimer);
		savedTimer = setTimeout(() => (justSaved = false), 2000);
	}

	function handleReset() {
		confirmReset = false;
		configState.reset();
	}

	// Edits live in memory until Save writes them to localStorage, so leaving
	// the page with a dirty config throws the work away.
	$effect(() => {
		if (!configState.dirty) return;

		const warn = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	});
</script>

{#if configState.dirty}
	<span class="dirty">{m.header_unsaved()}</span>
{/if}

<ActionButton size="s" onclick={handleSave} aria-label={m.header_save()}>
	<Icon icon={justSaved ? Check : Save} />
	<Text>{justSaved ? m.header_saved() : m.header_save()}</Text>
</ActionButton>

<ActionButton
	size="s"
	onclick={() => downloadSpectrumCss(configState.raw)}
	aria-label={m.header_export_css()}
>
	<Icon icon={Download} />
	<Text>{m.header_export_css()}</Text>
</ActionButton>

<ActionButton size="s" isQuiet onclick={() => (confirmReset = true)} aria-label={m.header_reset()}>
	<Text>{m.header_reset()}</Text>
</ActionButton>

<div class="color-space">
	<Picker
		selectedKey={colorSpaceState.id}
		onSelectionChange={(key: string | string[]) => colorSpaceState.setId(key as ColorSpaceId)}
		label={COLOR_SPACES[colorSpaceState.id].label}
		selectionMode="single"
		size="s"
	>
		<PickerTrigger />
		<PickerContent>
			{#each COLOR_SPACE_IDS as id (id)}
				<PickerItem value={id} label={COLOR_SPACES[id].label} />
			{/each}
		</PickerContent>
	</Picker>
</div>

<Dialog bind:open={confirmReset} size="s">
	<DialogContent>
		<DialogHeading>{m.header_reset_title()}</DialogHeading>
		<DialogBody>{m.header_reset_body()}</DialogBody>
		<DialogFooter>
			<ActionButton onclick={() => (confirmReset = false)}>{m.action_cancel()}</ActionButton>
			<ActionButton onclick={handleReset}>{m.header_reset()}</ActionButton>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	.dirty {
		font-size: var(--text-75);
		color: var(--neutral-subdued-content-color-default);
		white-space: nowrap;
	}

	.color-space {
		width: 8rem;
	}
</style>
