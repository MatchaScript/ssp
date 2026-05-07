<script lang="ts">
	import { JsonEditor } from '$lib/components/features/json-editor';
	import { configState } from '$lib/stores/config.svelte';
	import { ActionButton, Icon, Text } from '@matchalatte/ssp-ui';
	import { Copy, Check } from '@matchalatte/ssp-ui/components/icon';
	import { m } from '$lib/paraglide/messages';

	let editorRef: ReturnType<typeof JsonEditor> | undefined = $state();
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	function handleChange(value: string) {
		try {
			configState.updateFromJSON(value);
		} catch {
			// Invalid JSON — let Monaco show the syntax error, don't update store
		}
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
	<div class="editor-toolbar">
		<h1 class="editor-title">{m.editor_title()}</h1>
		<ActionButton size="s" isQuiet onclick={handleCopy} aria-label={m.editor_copy()}>
			<Icon icon={copied ? Check : Copy} />
			<Text>{copied ? m.editor_copied() : m.editor_copy()}</Text>
		</ActionButton>
	</div>

	<div class="editor-area">
		<JsonEditor bind:this={editorRef} value={configState.json} onchange={handleChange} />
	</div>
</div>

<style>
	.editor-page {
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100%;
		min-height: 0;
	}

	.editor-toolbar {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
		padding: var(--spacing-200) var(--spacing-400);
		border-bottom: 1px solid var(--gray-200);
	}

	.editor-title {
		flex: 1;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		margin: 0;
	}

	.editor-area {
		min-height: 0;
		overflow: hidden;
	}
</style>
