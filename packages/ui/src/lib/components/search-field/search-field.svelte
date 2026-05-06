<script lang="ts">
	import { Icon, Search, X } from '../icon/index.js';
	import { Label } from '../label/index.js';
	import { Field } from '../field/index.js';
	import '../field/field-input.css';
	import type { SearchFieldProps } from './types.js';

	let {
		value = $bindable(''),
		size = 'm',
		label = 'Search',
		labelPosition = 'top',
		hideLabel = true,
		icon,
		isDisabled = false,
		helpText,
		placeholder,
		name,
		onSubmit,
		onChange,
		onClear,
		class: className,
		...restProps
	}: SearchFieldProps = $props();

	let inputEl: HTMLInputElement | null = $state(null);

	const hasValue = $derived(value.length > 0);

	function handleInput() {
		onChange?.(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			onSubmit?.(value);
		}
		if (e.key === 'Escape' && hasValue) {
			e.preventDefault();
			clear();
		}
	}

	function clear() {
		value = '';
		onChange?.('');
		onClear?.();
		inputEl?.focus();
	}
</script>

{#snippet labelContent({ id }: { id: string })}
	<Label for={id}>{label}</Label>
{/snippet}

<Field
	{size}
	{labelPosition}
	{isDisabled}
	{helpText}
	minWidth="search"
	class={className}
	label={label && !hideLabel ? labelContent : undefined}
>
	{#snippet children({ id, helpTextId }: { id: string; helpTextId: string | undefined })}
		<div data-spectrum-search-field-icon>
			<Icon icon={icon ?? Search} {size} />
		</div>
		<input
			{id}
			type="search"
			{name}
			{placeholder}
			bind:value
			bind:this={inputEl}
			disabled={isDisabled}
			aria-describedby={helpTextId}
			aria-label={hideLabel && label ? label : undefined}
			data-spectrum-field-input
			oninput={handleInput}
			onkeydown={handleKeydown}
			{...restProps}
		/>
		{#if hasValue && !isDisabled}
			<button
				type="button"
				data-spectrum-search-field-clear-button
				aria-label="Clear search"
				tabindex={-1}
				onclick={clear}
			>
				<Icon icon={X} size={size === 'xl' ? 'l' : size === 'l' ? 'm' : 's'} />
			</button>
		{/if}
	{/snippet}
</Field>

<style>
	/* ===== Leading search icon =====
	   Both-side padding so there's a visual gap from FieldGroup edge and from
	   input text. Values come from <Field>'s --field-pad-inline cascade. */
	[data-spectrum-search-field-icon] {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--neutral-subdued-content-color-default);
		pointer-events: none;
		padding-inline: var(--field-pad-inline);
	}

	/* FieldGroup is a child component — :global() is required to reach its
	   [data-disabled] state across the component boundary. */
	:global([data-spectrum-field-group][data-disabled]) [data-spectrum-search-field-icon] {
		color: var(--disabled-content-color);
	}

	/* ===== Trailing clear button ===== */
	[data-spectrum-search-field-clear-button] {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		appearance: none;
		background: none;
		border: none;
		padding-inline: var(--field-pad-inline);
		padding-block: 0;
		margin: 0;
		cursor: pointer;
		color: var(--neutral-subdued-content-color-default);
		transition: color var(--duration-fast) var(--ease-out);
	}

	[data-spectrum-search-field-clear-button]:hover {
		color: var(--neutral-subdued-content-color-hover);
	}

	[data-spectrum-search-field-clear-button]:active {
		color: var(--neutral-subdued-content-color-down);
	}
</style>
