<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { FieldSize } from './types.js';

	interface Props {
		size?: FieldSize;
		isError?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		children?: Snippet;
		class?: string;
	}

	let {
		size = 'm',
		isError = false,
		isDisabled = false,
		isReadOnly = false,
		children,
		class: className
	}: Props = $props();

	function focusDelegate(currentTarget: HTMLElement) {
		currentTarget.querySelector<HTMLElement>('[data-spectrum-field-input]')?.focus();
	}

	function handlePointerDown(e: PointerEvent) {
		if (
			e.pointerType === 'mouse' &&
			!(e.target as Element).closest('button,input,textarea,[role="button"]')
		) {
			e.preventDefault();
			focusDelegate(e.currentTarget as HTMLElement);
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		const target = e.target as HTMLElement;
		if (!target.isContentEditable && !target.closest('button,input,textarea,[role="button"]')) {
			e.preventDefault();
			focusDelegate(e.currentTarget as HTMLElement);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={className}
	data-spectrum-field-group
	data-size={size}
	data-error={isError || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	onpointerdown={handlePointerDown}
	ontouchend={handleTouchEnd}
>
	{@render children?.()}
</div>

<style>
	[data-spectrum-field-group] {
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: center;
		box-sizing: border-box;
		width: 100%;
		background-color: var(--background-base-color);
		border: var(--border-width-200) solid var(--gray-300);
		border-radius: var(--corner-radius-medium-default);
		cursor: text;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			box-shadow var(--duration-fast) var(--ease-default),
			outline-color var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-field-group]:hover {
		border-color: var(--gray-400);
	}

	[data-spectrum-field-group]:focus-within {
		border-color: var(--neutral-content-color-hover);
	}

	/* :global() is required because the focusable descendant is rendered by
	   the consumer via <Field>'s `children` snippet, so Svelte's scoped CSS
	   cannot see it. */
	[data-spectrum-field-group]:has(:global(:focus-visible)) {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* Error */
	[data-spectrum-field-group][data-error] {
		border-color: var(--negative-background-color-default);
	}
	[data-spectrum-field-group][data-error]:hover {
		border-color: var(--negative-background-color-hover);
	}
	[data-spectrum-field-group][data-error]:focus-within {
		border-color: var(--negative-background-color-down);
	}

	/* Disabled */
	[data-spectrum-field-group][data-disabled] {
		background-color: var(--disabled-background-color);
		border-color: transparent;
		cursor: default;
	}
	[data-spectrum-field-group][data-disabled]:hover {
		border-color: transparent;
	}

	/* Readonly */
	[data-spectrum-field-group][data-readonly] {
		background-color: transparent;
		border-color: transparent;
	}
	[data-spectrum-field-group][data-readonly]:hover {
		border-color: transparent;
	}
	[data-spectrum-field-group][data-readonly]:has(:global(:focus-visible)) {
		outline: none;
	}

	/* Sizes — min-height per S2 spec */
	[data-spectrum-field-group][data-size='s'] {
		min-height: 24px;
		border-radius: var(--corner-radius-small-default);
	}
	[data-spectrum-field-group][data-size='m'] {
		min-height: 32px;
	}
	[data-spectrum-field-group][data-size='l'] {
		min-height: 40px;
	}
	[data-spectrum-field-group][data-size='xl'] {
		min-height: 48px;
	}
</style>
