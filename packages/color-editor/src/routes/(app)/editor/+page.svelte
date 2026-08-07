<script lang="ts">
	import { JsonEditor } from '$lib/components/features/json-editor';
	import { configState } from '$lib/stores/config.svelte';
	import { ActionButton, Icon, Text } from '@matchalatte/ssp-ui';
	import { Copy, Check } from '@matchalatte/ssp-ui/components/icon';
	import { PageHeader } from '$lib/components/layout';
	import { m } from '$lib/paraglide/messages';

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let invalid = $state(false);

	function handleChange(value: string) {
		// Monaco flags syntax errors itself; this covers JSON that parses but is
		// missing keys the palette needs, which would otherwise apply and break
		// every other page.
		invalid = !configState.updateFromJSON(value);
	}

	async function handleCopy() {
		const json = configState.json;
		await navigator.clipboard.writeText(json);

		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="editor-page">
	<PageHeader title={m.editor_title()}>
		{#snippet actions()}
			{#if invalid}
				<span class="editor-invalid">{m.editor_invalid_config()}</span>
			{/if}
			<ActionButton size="s" isQuiet onclick={handleCopy} aria-label={m.editor_copy()}>
				<Icon icon={copied ? Check : Copy} />
				<Text>{copied ? m.editor_copied() : m.editor_copy()}</Text>
			</ActionButton>
		{/snippet}
	</PageHeader>

	<div class="editor-area">
		<JsonEditor value={configState.json} onchange={handleChange} />
	</div>
</div>

<style>
	.editor-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.editor-invalid {
		font-size: var(--text-75);
		color: var(--negative-content-color-default);
	}

	.editor-area {
		min-height: 0;
		overflow: hidden;
	}
</style>
