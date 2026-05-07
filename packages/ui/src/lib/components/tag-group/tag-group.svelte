<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { Label } from '../label/index.js';
	import { HelpText } from '../field/index.js';
	import { TagGroupState, setTagGroupContext } from './tag-group.svelte.js';
	import type { TagGroupRootProps } from './types.js';

	const uid = $props.id();

	let {
		children,
		renderEmptyState,

		selectionMode = 'none',
		selectedKeys,
		defaultSelectedKeys,
		onSelectionChange,
		disallowEmptySelection = false,

		onRemove,

		isDisabled = false,
		disabledKeys = new Set<string>(),

		label,
		labelPosition = 'top',
		necessityIndicator = 'icon',
		helpText,
		errorMessage,
		isError = false,
		isReadOnly = false,
		isRequired = false,

		size = 'm',
		isEmphasized = false,

		ref = $bindable(null),
		class: className,
		...restProps
	}: TagGroupRootProps = $props();

	const isControlled = $derived(selectedKeys !== undefined);

	// svelte-ignore state_referenced_locally
	const internalSelectedKeys = new SvelteSet<string>(defaultSelectedKeys ?? []);

	const effectiveSelectedKeys = $derived(selectedKeys ?? internalSelectedKeys);

	function commitSelection(keys: Set<string>) {
		if (!isControlled) {
			internalSelectedKeys.clear();
			for (const k of keys) internalSelectedKeys.add(k);
		}
		onSelectionChange?.(new SvelteSet(keys));
	}

	const groupId = `${uid}-group`;
	const labelId = `${uid}-label`;
	const helpTextId = $derived(
		(isError && errorMessage) || (!isError && helpText) ? `${uid}-helptext` : undefined
	);

	const state = new TagGroupState({
		get size() {
			return size;
		},
		get isEmphasized() {
			return isEmphasized;
		},
		get isDisabled() {
			return isDisabled;
		},
		get isReadOnly() {
			return isReadOnly;
		},
		get disabledKeys() {
			return disabledKeys;
		},
		get selectionMode() {
			return selectionMode;
		},
		get selectedKeys() {
			return effectiveSelectedKeys;
		},
		get disallowEmptySelection() {
			return disallowEmptySelection;
		},
		onSelectionChange: commitSelection,
		get onRemove() {
			return onRemove;
		}
	});

	setTagGroupContext(state);

	function handleFocusIn() {
		state.onFocusIn();
		// First Tab into the grid: place roving focus on the first enabled row.
		if (!state.isCellModeActive && state.isEmpty === false) {
			// Highlighted is set lazily — sync only when nothing yet.
			queueMicrotask(() => state.focusFirst({ focusVisible: true }));
		}
	}

	function handleFocusOut() {
		state.onFocusOut();
	}
</script>

<div
	bind:this={ref}
	class={className}
	data-spectrum-tag-group
	data-size={size}
	data-emphasized={isEmphasized || undefined}
	data-disabled={isDisabled || undefined}
	data-readonly={isReadOnly || undefined}
	data-error={isError || undefined}
	data-empty={state.isEmpty || undefined}
	data-label-position={labelPosition}
>
	{#if label}
		<div data-spectrum-tag-group-label id={labelId}>
			<Label {isRequired} {necessityIndicator} for={groupId}>
				{#if typeof label === 'string'}
					{label}
				{:else}
					{@render label()}
				{/if}
			</Label>
		</div>
	{/if}

	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		id={groupId}
		role={state.isEmpty ? 'group' : 'grid'}
		aria-multiselectable={selectionMode === 'multiple' || undefined}
		aria-disabled={isDisabled || undefined}
		aria-readonly={isReadOnly || undefined}
		aria-invalid={isError || undefined}
		aria-required={isRequired || undefined}
		aria-labelledby={label ? labelId : restProps['aria-labelledby']}
		aria-label={!label ? restProps['aria-label'] : undefined}
		aria-describedby={helpTextId}
		data-spectrum-tag-group-list
		data-empty={state.isEmpty || undefined}
		tabindex={state.getContainerTabIndex()}
		onfocusin={(e) => {
			state.setFocusHost(e.currentTarget);
			handleFocusIn();
		}}
		onfocusout={handleFocusOut}
	>
		{#if state.isEmpty}
			{#if renderEmptyState}
				<div data-spectrum-tag-group-empty>
					{@render renderEmptyState()}
				</div>
			{:else}
				<div data-spectrum-tag-group-empty>No tags.</div>
			{/if}
		{:else}
			{@render children?.()}
		{/if}
	</div>

	{#if helpText || errorMessage}
		<div data-spectrum-tag-group-helptext>
			{#if isError && errorMessage}
				{#if typeof errorMessage === 'string'}
					<HelpText
						{size}
						{isError}
						{isDisabled}
						errorMessage={errorMessage}
						id={helpTextId}
					/>
				{:else}
					<div data-spectrum-help-text data-error data-size={size} id={helpTextId}>
						{@render errorMessage()}
					</div>
				{/if}
			{:else if !isError && helpText}
				{#if typeof helpText === 'string'}
					<HelpText {size} {isError} {isDisabled} description={helpText} id={helpTextId} />
				{:else}
					<div data-spectrum-help-text data-size={size} id={helpTextId}>
						{@render helpText()}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	[data-spectrum-tag-group] {
		display: flex;
		flex-direction: column;
		font-family: var(--font-sans);
	}

	[data-spectrum-tag-group][data-label-position='side'] {
		display: grid;
		grid-template-areas:
			'label list'
			'.     helptext';
		grid-template-columns: auto 1fr;
		align-items: start;
		column-gap: var(--spacing-200);
	}
	[data-spectrum-tag-group][data-label-position='side'] > [data-spectrum-tag-group-label] {
		grid-area: label;
		padding-block-start: var(--spacing-75);
	}
	[data-spectrum-tag-group][data-label-position='side'] > [data-spectrum-tag-group-list] {
		grid-area: list;
	}
	[data-spectrum-tag-group][data-label-position='side'] > [data-spectrum-tag-group-helptext] {
		grid-area: helptext;
	}

	[data-spectrum-tag-group-label] {
		color: var(--neutral-content-color-default);
		padding-block-end: var(--spacing-75);
	}
	[data-spectrum-tag-group][data-disabled] > [data-spectrum-tag-group-label] {
		color: var(--disabled-content-color);
	}

	[data-spectrum-tag-group][data-size='s'] > [data-spectrum-tag-group-label] {
		font-size: var(--text-75);
	}
	[data-spectrum-tag-group][data-size='m'] > [data-spectrum-tag-group-label] {
		font-size: var(--text-100);
	}
	[data-spectrum-tag-group][data-size='l'] > [data-spectrum-tag-group-label] {
		font-size: var(--text-200);
	}

	[data-spectrum-tag-group-list] {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-100);
		outline: none;
		min-height: var(--spacing-400);
	}

	[data-spectrum-tag-group-list]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
		border-radius: var(--corner-radius-small-default);
	}

	[data-spectrum-tag-group-empty] {
		color: var(--neutral-subdued-content-color-default);
		font-size: var(--text-100);
		padding: var(--spacing-200);
	}
</style>
