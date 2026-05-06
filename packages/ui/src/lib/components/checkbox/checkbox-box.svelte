<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon, Check, Minus } from '../icon/index.js';

	interface CheckboxBoxProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'size'> {
		checked?: boolean;
		indeterminate?: boolean;
		isDisabled?: boolean;
		isEmphasized?: boolean;
		isError?: boolean;
		size?: 's' | 'm' | 'l' | 'xl';
	}

	let {
		checked = false,
		indeterminate = false,
		isDisabled = false,
		isEmphasized = false,
		isError = false,
		size = 'm',
		...restProps
	}: CheckboxBoxProps = $props();
</script>

<span
	data-spectrum-checkbox-box
	data-size={size}
	data-checked={checked || undefined}
	data-indeterminate={indeterminate || undefined}
	data-disabled={isDisabled || undefined}
	data-emphasized={isEmphasized || undefined}
	data-error={isError || undefined}
	aria-hidden="true"
	{...restProps}
>
	<span data-spectrum-checkbox-icon data-visible={checked || indeterminate || undefined}>
		<span
			data-spectrum-checkbox-glyph="check"
			data-active={checked && !indeterminate || undefined}
		>
			<Icon icon={Check} size="xs" bold />
		</span>
		<span data-spectrum-checkbox-glyph="minus" data-active={indeterminate || undefined}>
			<Icon icon={Minus} size="xs" bold />
		</span>
	</span>
</span>

<style>
	[data-spectrum-checkbox-box] {
		position: relative;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		border: var(--border-width-200) solid var(--neutral-content-color-default);
		border-radius: var(--corner-radius-75);
		background-color: transparent;
		color: var(--background-base-color);
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default),
			outline-color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
		transform: scale(1);
		transform-origin: center;
	}

	[data-spectrum-checkbox-box][data-size='s'] {
		width: 14px;
		height: 14px;
	}
	[data-spectrum-checkbox-box][data-size='m'] {
		width: 16px;
		height: 16px;
	}
	[data-spectrum-checkbox-box][data-size='l'] {
		width: 18px;
		height: 18px;
	}
	[data-spectrum-checkbox-box][data-size='xl'] {
		width: 20px;
		height: 20px;
	}

	/* Checked / Indeterminate — neutral fill */
	[data-spectrum-checkbox-box][data-checked],
	[data-spectrum-checkbox-box][data-indeterminate] {
		border-color: transparent;
		background-color: var(--neutral-background-color-default);
	}

	/* Emphasized — accent fill when checked */
	[data-spectrum-checkbox-box][data-emphasized][data-checked],
	[data-spectrum-checkbox-box][data-emphasized][data-indeterminate] {
		background-color: var(--accent-background-color-default);
	}

	/* Error — negative border when unchecked, negative fill when checked */
	[data-spectrum-checkbox-box][data-error] {
		border-color: var(--negative-visual-color);
	}
	[data-spectrum-checkbox-box][data-error][data-checked],
	[data-spectrum-checkbox-box][data-error][data-indeterminate] {
		border-color: transparent;
		background-color: var(--negative-background-color-default);
	}

	/* Disabled takes precedence over all variants */
	[data-spectrum-checkbox-box][data-disabled] {
		border-color: var(--disabled-content-color);
		background-color: transparent;
		cursor: default;
	}
	[data-spectrum-checkbox-box][data-disabled][data-checked],
	[data-spectrum-checkbox-box][data-disabled][data-indeterminate] {
		border-color: transparent;
		background-color: var(--disabled-content-color);
	}

	[data-spectrum-checkbox-icon] {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		opacity: 0;
		transform: scale(0.8);
		transition:
			opacity var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
		pointer-events: none;
	}

	[data-spectrum-checkbox-icon][data-visible] {
		opacity: 1;
		transform: scale(1);
	}

	[data-spectrum-checkbox-glyph] {
		grid-area: 1 / 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: scale(0.7);
		transition:
			opacity var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
	}

	[data-spectrum-checkbox-glyph][data-active] {
		opacity: 1;
		transform: scale(1);
	}
</style>
