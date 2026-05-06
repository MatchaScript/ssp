<script lang="ts">
	import type { DialogContentProps } from './types.js';
	import { getDialogContext } from './dialog.svelte.js';
	import { Icon, X } from '$lib/components/icon';
	import ActionButton from '$lib/components/action-button/action-button.svelte';

	let { children, class: className, style: styleProp, ...restProps }: DialogContentProps = $props();

	const id = $props.id();
	const ctx = getDialogContext();
	ctx.dialogId = id;

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let gridEl = $state<HTMLDivElement | null>(null);

	// Sync open state with native <dialog> API
	$effect(() => {
		if (!dialogEl) return;
		if (ctx.isOpen) {
			if (!dialogEl.open) dialogEl.showModal();
		} else {
			if (dialogEl.open) dialogEl.close();
		}
	});

	function handleClose() {
		ctx.close();
	}

	function handleCancel(e: Event) {
		if (ctx.isKeyboardDismissDisabled) {
			e.preventDefault();
		}
	}

	function handleDialogClick(e: MouseEvent) {
		if (ctx.isDismissible && e.target === gridEl) {
			ctx.close();
		}
	}
</script>

<dialog
	bind:this={dialogEl}
	{id}
	data-spectrum-dialog
	aria-labelledby={ctx.headingId}
	aria-describedby={ctx.descriptionId}
	onclose={handleClose}
	oncancel={handleCancel}
	onclick={handleDialogClick}
>
	<!-- 3x3 grid: center = card, surrounding 8 cells = overlay -->
	<div bind:this={gridEl} data-spectrum-dialog-grid>
		<div
			{...restProps}
			class={className}
			style={styleProp}
			data-spectrum-dialog-card
			data-size={ctx.size}
		>
			{@render children?.()}
			{#if ctx.isDismissible}
				<ActionButton
					isQuiet
					size="s"
					data-spectrum-dialog-close-button
					onclick={() => dialogEl?.close()}
					aria-label="Close"
				>
					{#snippet icon()}
						<Icon icon={X} size="xs" />
					{/snippet}
				</ActionButton>
			{/if}
		</div>
	</div>
</dialog>

<style>
	/* ── Dialog element — viewport-filling container ── */
	[data-spectrum-dialog] {
		border: none;
		padding: 0;
		margin: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		max-width: none;
		max-height: none;
		background: transparent;
		overflow: hidden;

		/* Exit: keep rendered during close animation */
		transition:
			display var(--duration-100) allow-discrete,
			overlay var(--duration-100) allow-discrete;
	}

	[data-spectrum-dialog][open] {
		transition:
			display var(--duration-500) allow-discrete,
			overlay var(--duration-500) allow-discrete;
	}

	/* Disable native ::backdrop — overlay is handled by the grid */
	[data-spectrum-dialog]::backdrop {
		background: transparent;
	}

	/* ── Grid overlay — 3x3, card in center ── */
	[data-spectrum-dialog-grid] {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: 1fr auto 1fr;
		width: 100%;
		height: 100%;

		background-color: var(--transparent-black-500);
		transition: background-color var(--duration-100) var(--ease-out);
	}

	[data-spectrum-dialog][open] [data-spectrum-dialog-grid] {
		transition: background-color var(--duration-500) var(--ease-out);
	}

	[data-spectrum-dialog]:not([open]) [data-spectrum-dialog-grid] {
		background-color: transparent;
	}

	@starting-style {
		[data-spectrum-dialog][open] [data-spectrum-dialog-grid] {
			background-color: transparent;
		}
	}

	/* ── Card — center cell ── */
	[data-spectrum-dialog-card] {
		grid-column: 2;
		grid-row: 2;

		display: flex;
		flex-direction: column;
		position: relative;
		box-sizing: border-box;
		max-width: 90vw;
		max-height: 90vh;

		background-color: var(--background-layer-2-color);
		border-radius: var(--corner-radius-extra-large-default);
		box-shadow: var(--drop-shadow-elevated);
		outline: 1px solid transparent; /* WHCM */
		font-family: var(--font-sans);
		overflow: hidden;

		/* Exit target values */
		opacity: 0;
		translate: 0 0;
		transition:
			opacity var(--duration-100) var(--ease-out),
			translate var(--duration-100) var(--ease-out);
	}

	[data-spectrum-dialog][open] [data-spectrum-dialog-card] {
		opacity: 1;
		translate: 0 0;

		transition:
			opacity var(--duration-500) var(--ease-out),
			translate var(--duration-500) var(--ease-out);
		transition-delay: var(--duration-200);
	}

	@starting-style {
		[data-spectrum-dialog][open] [data-spectrum-dialog-card] {
			opacity: 0;
			translate: 0 20px;
		}
	}

	/* ── Card sizes (SP2 standard-dialog tokens) ── */
	[data-spectrum-dialog-card][data-size='s'] {
		width: 400px;
	}
	[data-spectrum-dialog-card][data-size='m'] {
		width: 480px;
	}
	[data-spectrum-dialog-card][data-size='l'] {
		width: 640px;
	}

	/* ── Close button ── */
	[data-spectrum-dialog-card] :global([data-spectrum-dialog-close-button]) {
		position: absolute;
		top: var(--spacing-200);
		inset-inline-end: var(--spacing-200);
	}
</style>
