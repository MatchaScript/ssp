<script lang="ts">
	import type { TooltipContentProps } from './types.js';
	import { getTooltipContext } from './tooltip.svelte.js';
	import { Tooltip } from 'bits-ui';
	import { Icon, AlertCircle } from '$lib/components/icon';

	let {
		label,
		class: className = '',
		style: styleProp = '',
		...restProps
	}: TooltipContentProps = $props();

	const state = getTooltipContext();

	const showIcon = $derived(state.hasIcon && state.variant !== 'neutral');

	const positionTryFallbacks = $derived(
		state.shouldFlip
			? state.placement === 'left' || state.placement === 'right'
				? 'flip-inline'
				: 'flip-block'
			: undefined
	);

	const contentStyle = $derived(
		[
			`position-anchor: ${state.anchorId}`,
			`--tooltip-max-width: ${state.maxWidth}px`,
			`--tooltip-offset: ${state.offset}px`,
			positionTryFallbacks ? `position-try-fallbacks: ${positionTryFallbacks}` : '',
			styleProp
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

<Tooltip.ContentStatic forceMount={false}>
	{#snippet child({ props })}
		<div
			{...props}
			{...restProps}
			class={className}
			style={contentStyle}
			data-spectrum-tooltip
			data-placement={state.placement}
			data-variant={state.variant !== 'neutral' ? state.variant : undefined}
		>
			{#if showIcon}
				<span data-spectrum-tooltip-icon>
					<Icon icon={AlertCircle} size="xs" />
				</span>
			{/if}
			<span data-spectrum-tooltip-label>{label}</span>
		</div>
	{/snippet}
</Tooltip.ContentStatic>

<style>
	/* ── Tooltip container ── */
	[data-spectrum-tooltip] {
		position: absolute;
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-75);
		max-width: var(--tooltip-max-width, 160px);
		min-height: 24px;
		box-sizing: border-box;
		padding-inline: var(--spacing-100);
		padding-block: var(--spacing-75);
		border-radius: var(--corner-radius-small-default);
		background-color: var(--neutral-background-color-default);
		color: var(--gray-25);
		font-family: var(--font-sans);
		font-size: var(--text-75);
		line-height: 1.3;
		overflow-wrap: break-word;
		z-index: 1000;

		/* Animation */
		opacity: 1;
		transition:
			opacity 200ms var(--ease-out),
			translate 200ms var(--ease-out);
	}

	/* ── Placement positioning via CSS Anchor ── */
	[data-spectrum-tooltip][data-placement='top'] {
		position-area: top;
		margin-bottom: calc(var(--tooltip-offset, 4px) + 5px);
	}

	[data-spectrum-tooltip][data-placement='bottom'] {
		position-area: bottom;
		margin-top: calc(var(--tooltip-offset, 4px) + 5px);
	}

	[data-spectrum-tooltip][data-placement='left'] {
		position-area: left;
		margin-right: calc(var(--tooltip-offset, 4px) + 5px);
	}

	[data-spectrum-tooltip][data-placement='right'] {
		position-area: right;
		margin-left: calc(var(--tooltip-offset, 4px) + 5px);
	}

	/* ── Enter/Exit animation ── */
	[data-spectrum-tooltip][data-state='delayed-open'],
	[data-spectrum-tooltip][data-state='instant-open'] {
		opacity: 1;
		translate: 0 0;
	}

	[data-spectrum-tooltip][data-state='closed'] {
		opacity: 0;
		pointer-events: none;
	}

	[data-spectrum-tooltip][data-state='closed'][data-placement='top'] {
		translate: 0 4px;
	}
	[data-spectrum-tooltip][data-state='closed'][data-placement='bottom'] {
		translate: 0 -4px;
	}
	[data-spectrum-tooltip][data-state='closed'][data-placement='left'] {
		translate: 4px 0;
	}
	[data-spectrum-tooltip][data-state='closed'][data-placement='right'] {
		translate: -4px 0;
	}

	/* ── Semantic variants ── */
	[data-spectrum-tooltip][data-variant='informative'] {
		background-color: var(--informative-background-color-default);
	}

	[data-spectrum-tooltip][data-variant='negative'] {
		background-color: var(--negative-background-color-default);
	}

	/* ── Icon ── */
	[data-spectrum-tooltip-icon] {
		display: inline-flex;
		flex-shrink: 0;
		color: inherit;
	}

	/* ── Label ── */
	[data-spectrum-tooltip-label] {
		flex: 1;
		min-width: 0;
	}

	/* ── Tip (arrow) ── */
	[data-spectrum-tooltip]::after {
		content: '';
		position: absolute;
		width: 10px;
		height: 5px;
		background-color: var(--neutral-background-color-default);
		clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
	}

	[data-spectrum-tooltip][data-variant='informative']::after {
		background-color: var(--informative-background-color-default);
	}

	[data-spectrum-tooltip][data-variant='negative']::after {
		background-color: var(--negative-background-color-default);
	}

	/* Tip placement */
	[data-spectrum-tooltip][data-placement='top']::after {
		bottom: -5px;
		left: 50%;
		translate: -50% 0;
	}

	[data-spectrum-tooltip][data-placement='bottom']::after {
		top: -5px;
		left: 50%;
		translate: -50% 0;
		clip-path: polygon(0% 100%, 100% 100%, 50% 0%);
	}

	[data-spectrum-tooltip][data-placement='left']::after {
		right: -5px;
		top: 50%;
		translate: 0 -50%;
		width: 5px;
		height: 10px;
		clip-path: polygon(0% 0%, 0% 100%, 100% 50%);
	}

	[data-spectrum-tooltip][data-placement='right']::after {
		left: -5px;
		top: 50%;
		translate: 0 -50%;
		width: 5px;
		height: 10px;
		clip-path: polygon(100% 0%, 100% 100%, 0% 50%);
	}
</style>
