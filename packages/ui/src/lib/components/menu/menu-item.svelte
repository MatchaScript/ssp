<script lang="ts">
	import { untrack } from 'svelte';
	import Icon from '$lib/components/icon/icon.svelte';
	import { ChevronRight, ExternalLink } from '$lib/components/icon';
	import { CheckboxBox } from '../checkbox/index.js';
	import { getMenuContext, getSubmenuTriggerContext } from './menu.svelte.js';
	import type { MenuItemProps } from './types.js';

	let {
		id,
		children,
		icon,
		description,
		value,
		shortcut,
		isDisabled = false,
		textValue,
		href,
		target,
		rel,
		download,
		hideLinkOutIcon = false,
		style: styleProp = '',
		onclick,
		onkeydown,
		onpointerenter,
		onpointerleave,
		ref = $bindable(null),
		...restProps
	}: MenuItemProps = $props();

	const domId = $props.id();
	const menuState = getMenuContext();
	const submenuCtx = getSubmenuTriggerContext();

	const isSelected = $derived(menuState.isSelected(id));
	const showCheckmark = $derived(menuState.selectionMode !== 'none');
	const isSubmenuTrigger = !!submenuCtx;
	const isLink = $derived(href != null);
	const isLinkOut = $derived(isLink && target === '_blank');
	const tag = $derived(isLink ? 'a' : 'div');
	const itemStyle = $derived(
		[isSubmenuTrigger ? `anchor-name: ${submenuCtx?.anchorId}` : '', styleProp]
			.filter(Boolean)
			.join('; ')
	);
	// External links without an explicit rel get the safe defaults.
	const resolvedRel = $derived(isLinkOut ? (rel ?? 'noopener noreferrer') : rel);

	const role = $derived(
		menuState.selectionMode === 'single'
			? 'menuitemradio'
			: menuState.selectionMode === 'multiple'
				? 'menuitemcheckbox'
				: 'menuitem'
	);

	// Register with MenuState on ref change only. disabled/textValue are synced
	// reactively by the updateItem effect below — reading them here (tracked) would
	// cause unregister/re-register on every toggle, which also clears highlightedId.
	$effect(() => {
		const el = ref;
		if (!el) return;
		return untrack(() => {
			const cleanup = menuState.registerItem({
				domId,
				value: id,
				el,
				disabled: isDisabled,
				textValue: textValue ?? el.textContent?.trim() ?? ''
			});
			submenuCtx?.registerTriggerItem(el);
			return cleanup;
		});
	});

	// Keep disabled/textValue in sync
	$effect(() => {
		menuState.updateItem(domId, {
			disabled: isDisabled,
			textValue: textValue ?? ref?.textContent?.trim() ?? ''
		});
	});

	function handlePointerEnter(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerenter?.(event);
		if (isDisabled) return;
		menuState.highlight(domId, { focusVisible: false });
		submenuCtx?.handleTriggerPointerEnter();
	}

	function handlePointerLeave(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) {
		onpointerleave?.(event);
		submenuCtx?.handleTriggerPointerLeave();
	}

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		if (isDisabled) {
			// Prevent navigation on disabled links.
			if (isLink) event.preventDefault();
			return;
		}
		onclick?.(event);
		if (event.defaultPrevented) return;
		if (isSubmenuTrigger) {
			submenuCtx?.openSubmenu();
			return;
		}
		// For links, selectItem closes the menu / fires onAction / updates selection;
		// the browser still handles the navigation because we don't preventDefault.
		menuState.selectItem(domId);
	}

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLElement }) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		// Let submenu trigger handle ArrowRight
		if (submenuCtx) {
			submenuCtx.handleSubTriggerKeydown(event);
		}
	}
</script>

<svelte:element
	this={tag}
	{...restProps}
	bind:this={ref}
	{role}
	tabindex={menuState.itemTabIndex(domId)}
	href={isLink ? href : undefined}
	target={isLink ? target : undefined}
	rel={isLink ? resolvedRel : undefined}
	download={isLink ? download : undefined}
	data-spectrum-menu-item
	data-size={menuState.size}
	data-disabled={isDisabled || undefined}
	data-selected={isSelected || undefined}
	data-link={isLink || undefined}
	aria-checked={showCheckmark ? isSelected : undefined}
	aria-disabled={isDisabled || undefined}
	aria-haspopup={isSubmenuTrigger ? 'menu' : undefined}
	aria-expanded={isSubmenuTrigger ? submenuCtx?.open : undefined}
	style={itemStyle || undefined}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	{#if showCheckmark && !isSubmenuTrigger}
		<div class="checkmark-slot" data-mode={menuState.selectionMode}>
			{#if menuState.selectionMode === 'single'}
				{#if isSelected}
					<div class="radio-dot"></div>
				{/if}
			{:else}
				<CheckboxBox checked={isSelected} isEmphasized {isDisabled} size={menuState.size} />
			{/if}
		</div>
	{/if}
	{#if icon}
		<div class="icon-slot">{@render icon()}</div>
	{/if}
	<div class="label-slot">
		{@render children?.()}
	</div>
	{#if description}
		<div class="description-slot">
			{#if typeof description === 'string'}
				{description}
			{:else}
				{@render description()}
			{/if}
		</div>
	{/if}
	{#if value}
		<div class="value-slot">
			{#if typeof value === 'string'}
				{value}
			{:else}
				{@render value()}
			{/if}
		</div>
	{/if}
	{#if shortcut && !isSubmenuTrigger}
		<div class="keyboard-slot">
			{#if typeof shortcut === 'string'}
				<kbd>{shortcut}</kbd>
			{:else}
				{@render shortcut()}
			{/if}
		</div>
	{/if}
	{#if isLinkOut && !hideLinkOutIcon && !isSubmenuTrigger}
		<div class="descriptor-slot">
			<Icon icon={ExternalLink} size={menuState.size} />
		</div>
	{/if}
	{#if isSubmenuTrigger}
		<div class="descriptor-slot">
			<Icon icon={ChevronRight} size={menuState.size} />
		</div>
	{/if}
</svelte:element>

<style>
	@import './menu-item.css';

	.radio-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: currentColor;
	}

	/* Focus visible ring */
	[data-spectrum-menu-item]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: calc(-1 * var(--focus-indicator-thickness));
	}

	/* Sub-trigger stays highlighted while its submenu is open */
	[data-spectrum-menu-item][aria-expanded='true'] {
		background-color: var(--neutral-subtle-background-color-default);
	}
</style>
