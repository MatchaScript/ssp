<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from '$lib/components/icon/icon.svelte';
	import { ChevronRight, ExternalLink } from '$lib/components/icon';
	import { CheckboxBox } from '../checkbox/index.js';
	import { getMenuContext, getSubmenuTriggerContext } from './menu.svelte.js';

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
		ref = $bindable(null),
		...restProps
	}: Omit<HTMLAttributes<HTMLElement>, 'id' | 'role'> & {
		/** Semantic key for this item — used for selection and onAction callbacks. */
		id: string;
		/** Primary label content. */
		children?: Snippet;
		/** Icon displayed before the label. */
		icon?: Snippet;
		/** Secondary line below the label. */
		description?: Snippet | string;
		/** Small text between label and keyboard shortcut (e.g. selected submenu value). */
		value?: Snippet | string;
		/** Keyboard shortcut. */
		shortcut?: Snippet | string;
		isDisabled?: boolean;
		/** Text for typeahead matching. Defaults to element textContent. */
		textValue?: string;
		/** When set, the item renders as `<a>` and navigates on activation. */
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top' | (string & {});
		rel?: string;
		download?: string | boolean;
		/** Suppress the auto LinkOut icon on target="_blank" links. */
		hideLinkOutIcon?: boolean;
		ref?: HTMLElement | null;
	} = $props();

	const domId = $props.id();
	const menuState = getMenuContext();
	const submenuCtx = getSubmenuTriggerContext();

	const isHighlighted = $derived(menuState.highlightedId === domId);
	const isSelected = $derived(menuState.isSelected(id));
	const showCheckmark = $derived(menuState.selectionMode !== 'none');
	const isSubmenuTrigger = !!submenuCtx;
	const isLink = $derived(href != null);
	const isLinkOut = $derived(isLink && target === '_blank');
	const tag = $derived(isLink ? 'a' : 'div');
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

	function handlePointerEnter() {
		if (isDisabled) return;
		menuState.highlight(domId, { focusVisible: false });
		submenuCtx?.handleTriggerPointerEnter();
	}

	function handlePointerLeave() {
		submenuCtx?.handleTriggerPointerLeave();
	}

	function handleClick(event: MouseEvent) {
		if (isDisabled) {
			// Prevent navigation on disabled links.
			if (isLink) event.preventDefault();
			return;
		}
		if (isSubmenuTrigger) {
			submenuCtx?.openSubmenu();
			return;
		}
		// For links, selectItem closes the menu / fires onAction / updates selection;
		// the browser still handles the navigation because we don't preventDefault.
		menuState.selectItem(domId);
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Let submenu trigger handle ArrowRight
		if (submenuCtx) {
			submenuCtx.handleSubTriggerKeydown(event);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<svelte:element
	this={tag}
	bind:this={ref}
	{role}
	tabindex={isHighlighted ? 0 : -1}
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
	style={isSubmenuTrigger ? `anchor-name: ${submenuCtx?.anchorId}` : undefined}
	{...restProps}
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
				<CheckboxBox
					checked={isSelected}
					isEmphasized
					isDisabled={isDisabled}
					size={menuState.size}
				/>
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
