<script lang="ts">
	import { untrack } from 'svelte';
	import { getTagGroupContext } from './tag-group.svelte.js';
	import type { TagItemProps } from './types.js';
	import { Icon, X } from '../icon/index.js';

	let {
		id,
		children,
		icon,
		textValue,
		isDisabled = false,
		href,
		target,
		rel,
		download,
		ref = $bindable(null),
		class: className,
		...restProps
	}: TagItemProps = $props();

	const domId = $props.id();
	const removeBtnId = `${domId}-remove`;
	const state = getTagGroupContext();

	let isTagDisabled = $derived(state.isTagDisabled(id) || isDisabled);
	let isSelected = $derived(state.isSelected(id));
	let isRowFocused = $derived(state.isRowFocused(domId));

	// Mount registration — capture id once, ignore reactive churn afterwards.
	$effect(() => {
		const el = ref;
		if (!el) return;
		return untrack(() =>
			state.registerTag({
				domId,
				value: id,
				el,
				disabled: isTagDisabled,
				textValue: textValue ?? el.textContent?.trim() ?? '',
				isLink: !!href
			})
		);
	});

	// Sync mutable fields without re-registering.
	$effect(() => {
		state.updateTag(domId, {
			disabled: isTagDisabled,
			textValue: textValue ?? ref?.textContent?.trim() ?? '',
			isLink: !!href
		});
	});

	function handleRowClick(event: MouseEvent) {
		if (isTagDisabled) return;
		state.onRowClick(id, event);
	}

	function handleRowKeydown(event: KeyboardEvent) {
		if (isTagDisabled) return;
		state.onRowKeydown(event, id);
	}

	function handleCellKeydown(event: KeyboardEvent, cellId: 'content' | 'remove') {
		if (isTagDisabled) return;
		state.onCellKeydown(event, id, cellId);
	}

	function handleRemoveClick(event: MouseEvent) {
		event.stopPropagation();
		if (isTagDisabled) return;
		state.removeKey(id);
	}
</script>

<div
	bind:this={ref}
	role="row"
	id={domId}
	aria-selected={state.selectionMode !== 'none' && !href ? isSelected : undefined}
	aria-disabled={isTagDisabled || undefined}
	data-spectrum-tag
	data-key={id}
	data-size={state.size}
	data-emphasized={state.isEmphasized || undefined}
	data-selected={isSelected || undefined}
	data-disabled={isTagDisabled || undefined}
	data-focused={isRowFocused || undefined}
	data-allows-removing={state.allowsRemoving || undefined}
	data-selection-mode={state.selectionMode === 'none' ? undefined : state.selectionMode}
	data-link={href ? '' : undefined}
	tabindex={state.getRowTabIndex(domId)}
	class={className}
	onclick={handleRowClick}
	onkeydown={handleRowKeydown}
	onfocus={() => state.onRowFocus(domId)}
	{...restProps}
>
	<div
		role="gridcell"
		data-spectrum-tag-cell-id="content"
		data-spectrum-tag-content
		tabindex={state.getCellTabIndex(id, 'content')}
		onfocus={() => state.onCellFocus(id, 'content')}
		onkeydown={(e) => handleCellKeydown(e, 'content')}
		style="display: contents;"
	>
		<span data-spectrum-tag-content-inner>
			{#if href}
				<a {href} {target} {rel} {download} data-tag-link tabindex="-1" aria-hidden="true"
				></a>
			{/if}
			{#if icon}
				<span data-spectrum-tag-icon>
					{@render icon()}
				</span>
			{/if}
			<span data-spectrum-tag-text>
				{@render children?.()}
			</span>
		</span>
	</div>

	{#if state.allowsRemoving}
		<div
			role="gridcell"
			data-spectrum-tag-cell-id="remove"
			style="display: contents;"
		>
			<button
				type="button"
				id={removeBtnId}
				data-spectrum-tag-remove
				tabindex={state.getCellTabIndex(id, 'remove')}
				disabled={isTagDisabled}
				aria-label="Remove"
				aria-labelledby="{removeBtnId} {domId}"
				onclick={handleRemoveClick}
				onfocus={() => state.onCellFocus(id, 'remove')}
				onkeydown={(e) => handleCellKeydown(e, 'remove')}
			>
				<Icon icon={X} size="xs" />
			</button>
		</div>
	{/if}
</div>
