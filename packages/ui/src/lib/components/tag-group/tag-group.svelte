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
