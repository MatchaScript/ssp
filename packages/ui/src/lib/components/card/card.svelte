<script lang="ts">
	import type { CardProps } from './types.js';

	let {
		variant = 'primary',
		size = 'm',
		density = 'regular',
		href,
		preview,
		heading,
		description,
		footer,
		class: className,
		...restProps
	}: CardProps = $props();

	const element = $derived(href ? 'a' : restProps.onclick ? 'button' : 'div');
	const isInteractive = $derived(!!href || !!restProps.onclick);
</script>

<svelte:element
	this={element}
	{...restProps}
	class={className}
	data-spectrum-card
	data-variant={variant}
	data-size={size}
	data-density={density}
	data-interactive={isInteractive || undefined}
	href={element === 'a' ? href : undefined}
	type={element === 'button' ? 'button' : undefined}
>
	{#if preview}
		<div data-spectrum-card-preview>
			{@render preview()}
		</div>
	{/if}

	<div data-spectrum-card-content>
		<div data-spectrum-card-heading>
			{@render heading()}
		</div>
		{#if description}
			<div data-spectrum-card-description>
				{@render description()}
			</div>
		{/if}
	</div>

	{#if footer}
		<div data-spectrum-card-footer>
			{@render footer()}
		</div>
	{/if}
</svelte:element>

<style>
	/* ══════════════════════════════════════════════════
	   Base
	══════════════════════════════════════════════════ */
	[data-spectrum-card] {
		display: flex;
		flex-direction: column;
		position: relative;
		box-sizing: border-box;
		overflow: clip;
		text-decoration: none;
		color: inherit;
		font-family: inherit;
		border: none;
		background: none;
		contain: layout;
		transition:
			box-shadow var(--duration-normal) var(--ease-default),
			background-color var(--duration-normal) var(--ease-default),
			transform var(--duration-normal) var(--ease-default);
	}

	/* ══════════════════════════════════════════════════
	   Size → border-radius
	══════════════════════════════════════════════════ */
	[data-spectrum-card][data-size='s'] {
		border-radius: var(--corner-radius-200);
	}
	[data-spectrum-card][data-size='m'] {
		border-radius: var(--corner-radius-300);
	}
	[data-spectrum-card][data-size='l'] {
		border-radius: var(--corner-radius-400);
	}

	/* ══════════════════════════════════════════════════
	   Density → internal spacing (CSS custom prop)
	══════════════════════════════════════════════════ */
	[data-spectrum-card][data-density='compact'][data-size='s'] {
		--_card-space: var(--space-1);
	}
	[data-spectrum-card][data-density='compact'][data-size='m'] {
		--_card-space: var(--space-2);
	}
	[data-spectrum-card][data-density='compact'][data-size='l'] {
		--_card-space: var(--space-3);
	}

	[data-spectrum-card][data-density='regular'][data-size='s'] {
		--_card-space: var(--space-2);
	}
	[data-spectrum-card][data-density='regular'][data-size='m'] {
		--_card-space: var(--space-3);
	}
	[data-spectrum-card][data-density='regular'][data-size='l'] {
		--_card-space: var(--space-4);
	}

	[data-spectrum-card][data-density='spacious'][data-size='s'] {
		--_card-space: var(--space-3);
	}
	[data-spectrum-card][data-density='spacious'][data-size='m'] {
		--_card-space: var(--space-4);
	}
	[data-spectrum-card][data-density='spacious'][data-size='l'] {
		--_card-space: var(--space-5);
	}

	/* ══════════════════════════════════════════════════
	   Variants
	══════════════════════════════════════════════════ */

	/* ── primary: elevated surface + shadow ─────── */
	[data-spectrum-card][data-variant='primary'] {
		background-color: var(--background-layer-2-color);
		box-shadow: var(--drop-shadow-emphasized);
	}

	/* ── secondary: layer-1 surface + shadow ────── */
	[data-spectrum-card][data-variant='secondary'] {
		background-color: var(--background-layer-1-color);
		box-shadow: var(--drop-shadow-emphasized);
	}

	/* ── tertiary: border via box-shadow ─────────── */
	[data-spectrum-card][data-variant='tertiary'] {
		background-color: transparent;
		box-shadow: inset 0 0 0 2px var(--gray-100);
	}

	/* ── quiet: no chrome ────────────────────────── */
	[data-spectrum-card][data-variant='quiet'] {
		background-color: transparent;
		overflow: visible;
	}

	/* ══════════════════════════════════════════════════
	   Interactive states
	══════════════════════════════════════════════════ */
	[data-spectrum-card][data-interactive] {
		cursor: pointer;
	}

	/* ── primary / secondary hover ────────────────── */
	[data-spectrum-card][data-interactive][data-variant='primary']:hover,
	[data-spectrum-card][data-interactive][data-variant='secondary']:hover {
		box-shadow: var(--drop-shadow-elevated);
	}

	[data-spectrum-card][data-interactive][data-variant='primary']:active,
	[data-spectrum-card][data-interactive][data-variant='secondary']:active {
		box-shadow: var(--drop-shadow-emphasized);
		transform: scale(0.98);
	}

	/* ── tertiary hover ───────────────────────────── */
	[data-spectrum-card][data-interactive][data-variant='tertiary']:hover {
		box-shadow: inset 0 0 0 2px var(--gray-200);
		background-color: var(--neutral-subtle-background-color-default);
	}

	[data-spectrum-card][data-interactive][data-variant='tertiary']:active {
		box-shadow: inset 0 0 0 2px var(--gray-200);
		transform: scale(0.98);
	}

	/* ── quiet hover ──────────────────────────────── */
	[data-spectrum-card][data-interactive][data-variant='quiet']:hover {
		background-color: var(--neutral-subtle-background-color-default);
	}

	[data-spectrum-card][data-interactive][data-variant='quiet']:active {
		background-color: var(--neutral-subdued-background-color-default);
		transform: scale(0.98);
	}

	/* ── Focus ring ───────────────────────────────── */
	[data-spectrum-card][data-interactive]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}

	/* ══════════════════════════════════════════════════
	   Preview
	══════════════════════════════════════════════════ */
	[data-spectrum-card-preview] {
		position: relative;
		overflow: clip;
	}

	[data-spectrum-card-preview] :global(img),
	[data-spectrum-card-preview] :global(svg) {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}

	/* ══════════════════════════════════════════════════
	   Content (heading + description)
	══════════════════════════════════════════════════ */
	[data-spectrum-card-content] {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding: var(--_card-space);
		gap: calc(var(--_card-space) * 0.5);
	}

	/* preview がある場合、content の上パディングはスペーシングに従う（previewとの間隔） */
	[data-spectrum-card-preview] + [data-spectrum-card-content] {
		padding-top: var(--_card-space);
	}

	/* ── Heading ──────────────────────────────────── */
	[data-spectrum-card-heading] {
		font-weight: 600;
		color: var(--neutral-content-color-default);
		line-height: var(--lh-heading);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	[data-spectrum-card][data-size='s'] [data-spectrum-card-heading] {
		font-size: var(--text-100);
	}
	[data-spectrum-card][data-size='m'] [data-spectrum-card-heading] {
		font-size: var(--text-200);
	}
	[data-spectrum-card][data-size='l'] [data-spectrum-card-heading] {
		font-size: var(--text-300);
	}

	/* ── Description ──────────────────────────────── */
	[data-spectrum-card-description] {
		font-weight: 400;
		color: var(--neutral-subdued-content-color-default);
		line-height: var(--lh-body);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		line-clamp: 3;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	[data-spectrum-card][data-size='s'] [data-spectrum-card-description] {
		font-size: var(--text-75);
	}
	[data-spectrum-card][data-size='m'] [data-spectrum-card-description] {
		font-size: var(--text-100);
	}
	[data-spectrum-card][data-size='l'] [data-spectrum-card-description] {
		font-size: var(--text-100);
	}

	/* ══════════════════════════════════════════════════
	   Footer
	══════════════════════════════════════════════════ */
	[data-spectrum-card-footer] {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: 0 var(--_card-space) var(--_card-space);
	}
</style>
