<script lang="ts">
	import type { FieldSize } from './types.js';

	interface Props {
		size?: FieldSize;
		isError?: boolean;
		isDisabled?: boolean;
		description?: string;
		errorMessage?: string;
		id?: string;
	}

	let {
		size = 'm',
		isError = false,
		isDisabled = false,
		description,
		errorMessage,
		id
	}: Props = $props();

	const visible = $derived((isError && errorMessage) || (!isError && description));
	const text = $derived(isError && errorMessage ? errorMessage : description);
</script>

{#if visible}
	<div
		{id}
		data-spectrum-help-text
		data-size={size}
		data-variant={isError ? 'negative' : 'neutral'}
		data-disabled={isDisabled || undefined}
	>
		{text}
	</div>
{/if}

<style>
	[data-spectrum-help-text] {
		font-family: var(--font-sans);
		line-height: var(--lh-detail);
		padding-block-start: var(--spacing-75);
	}

	[data-spectrum-help-text][data-variant='neutral'] {
		color: var(--neutral-subdued-content-color-default);
	}
	[data-spectrum-help-text][data-variant='negative'] {
		color: var(--negative-content-color-default);
	}

	[data-spectrum-help-text][data-disabled] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-help-text][data-size='s'],
	[data-spectrum-help-text][data-size='m'] {
		font-size: var(--text-75);
	}
	[data-spectrum-help-text][data-size='l'],
	[data-spectrum-help-text][data-size='xl'] {
		font-size: var(--text-100);
	}
</style>
