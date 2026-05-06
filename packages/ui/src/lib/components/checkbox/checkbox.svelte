<script lang="ts">
	import Label from '../label/label.svelte';
	import CheckboxBox from './checkbox-box.svelte';
	import type { CheckboxProps } from './types.js';

	let {
		checked = $bindable(false),
		indeterminate = $bindable(false),
		isDisabled = false,
		size = 'm',
		isEmphasized = false,
		isError = false,
		children,
		class: className,
		id,
		...restProps
	}: CheckboxProps = $props();

	const fallbackId = $props.id();
	const checkboxId = $derived(id ?? fallbackId);
</script>

<div
	class={className}
	data-spectrum-checkbox
	data-size={size}
	data-emphasized={isEmphasized || undefined}
	data-disabled={isDisabled || undefined}
	data-error={isError || undefined}
>
	<input
		id={checkboxId}
		type="checkbox"
		bind:checked
		bind:indeterminate
		disabled={isDisabled}
		class="visually-hidden"
		{...restProps}
	/>
	<label for={checkboxId} data-spectrum-checkbox-box-wrapper>
		<CheckboxBox {checked} {indeterminate} {isDisabled} {isEmphasized} {isError} {size} />
	</label>
	{#if children}
		<div data-spectrum-checkbox-label>
			<Label for={checkboxId}>{@render children()}</Label>
		</div>
	{/if}
</div>

<style>
	[data-spectrum-checkbox] {
		display: inline-flex;
		align-items: flex-start;
		column-gap: var(--space-2);
		line-height: var(--lh-component);
		font-family: inherit;
		box-sizing: border-box;
		margin: 0;
		color: var(--neutral-content-color-default);
	}

	[data-spectrum-checkbox][data-size='s'] {
		font-size: var(--text-75);
	}
	[data-spectrum-checkbox][data-size='m'] {
		font-size: var(--text-100);
	}
	[data-spectrum-checkbox][data-size='l'] {
		font-size: var(--text-200);
	}
	[data-spectrum-checkbox][data-size='xl'] {
		font-size: var(--text-300);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Wrapper around the visual CheckboxBox — click target for toggling.
	   block-size: 1lh で1行分の高さを確保し、box を中央寄せすることで
	   テキストが複数行に折り返しても box は1行目の中心と整列する。 */
	[data-spectrum-checkbox-box-wrapper] {
		display: inline-flex;
		align-items: center;
		block-size: 1lh;
	}

	/* Label wrapper — <Label> reads font-size / color from inherit. */
	[data-spectrum-checkbox][data-disabled] > [data-spectrum-checkbox-label] {
		color: var(--disabled-content-color);
	}

	/* Hover + focus-ring target the child CheckboxBox. Since the box lives in a
	   child component (different scope hash), wrap with :global {}. data-spectrum-*
	   attributes are already namespaced by design system convention. */
	:global {
		[data-spectrum-checkbox]:not([data-disabled]):hover
			[data-spectrum-checkbox-box]:not([data-checked]):not([data-indeterminate]) {
			border-color: var(--neutral-content-color-hover);
		}

		[data-spectrum-checkbox]:not([data-disabled]):hover
			[data-spectrum-checkbox-box]:is([data-checked], [data-indeterminate]):not(
				[data-emphasized]
			):not([data-error]) {
			background-color: var(--neutral-background-color-hover);
		}

		[data-spectrum-checkbox]:not([data-disabled]):hover
			[data-spectrum-checkbox-box][data-emphasized]:is([data-checked], [data-indeterminate]) {
			background-color: var(--accent-background-color-hover);
		}

		[data-spectrum-checkbox]:not([data-disabled]):hover
			[data-spectrum-checkbox-box][data-error]:is([data-checked], [data-indeterminate]) {
			background-color: var(--negative-background-color-hover);
		}

		[data-spectrum-checkbox]
			input:focus-visible
			~ [data-spectrum-checkbox-box-wrapper]
			> [data-spectrum-checkbox-box] {
			outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
			outline-offset: var(--focus-indicator-gap);
		}

		[data-spectrum-checkbox]:not([data-disabled]):active
			[data-spectrum-checkbox-box-wrapper]
			> [data-spectrum-checkbox-box] {
			transform: scale(0.95);
		}
	}
</style>
