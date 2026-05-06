<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type SemanticVariant = 'accent' | 'informative' | 'neutral' | 'positive' | 'notice' | 'negative';
	type ColorVariant =
		| 'red'
		| 'orange'
		| 'yellow'
		| 'chartreuse'
		| 'celery'
		| 'green'
		| 'seafoam'
		| 'cyan'
		| 'blue'
		| 'indigo'
		| 'purple'
		| 'fuchsia'
		| 'magenta'
		| 'gray';
	type Variant = SemanticVariant | ColorVariant;
	type Size = 'S' | 'M' | 'L' | 'XL';
	type FillStyle = 'bold' | 'subtle' | 'outline';

	type Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
		size?: Size;
		fillStyle?: FillStyle;
		icon?: Snippet;
		children?: Snippet;
	};

	let {
		variant = 'neutral',
		size = 'S',
		fillStyle = 'bold',
		icon,
		children,
		class: className,
		...restProps
	}: Props = $props();
</script>

<div
	data-spectrum-badge
	data-variant={variant}
	data-size={size}
	data-fill={fillStyle}
	class={className}
	{...restProps}
>
	{#if icon}
		<span data-icon>
			{@render icon()}
		</span>
	{/if}
	{#if children}
		<span data-label>
			{@render children()}
		</span>
	{/if}
</div>

<style>
	/* ══════════════════════════════════════════════════
	   Base
	══════════════════════════════════════════════════ */
	[data-spectrum-badge] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		gap: var(--_badge-gap);
		box-sizing: border-box;
		min-block-size: var(--_badge-min-height);
		padding-block: var(--_badge-padding-block);
		padding-inline: var(--_badge-padding-inline);

		font-family: inherit;
		font-size: var(--_badge-font-size);
		font-weight: 500;
		line-height: var(--lh-component);

		border: var(--border-width-200) solid var(--_badge-border, transparent);
		border-radius: var(--_badge-radius);
		background-color: var(--_badge-bg);
		color: var(--_badge-text);

		white-space: nowrap;
		user-select: none;
		cursor: default;

		/* ── size M defaults ── */
		--_badge-min-height: 32px;
		--_badge-font-size: var(--text-100);
		--_badge-radius: var(--corner-radius-medium-size-medium);
		--_badge-padding-inline: var(--space-3);
		--_badge-padding-block: 0;
		--_badge-gap: 6px;
	}

	[data-spectrum-badge] [data-icon] {
		display: grid;
		place-items: center;
		flex-shrink: 0;
	}

	[data-spectrum-badge] [data-label] {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ══════════════════════════════════════════════════
	   Sizes
	══════════════════════════════════════════════════ */
	[data-spectrum-badge][data-size='S'] {
		--_badge-min-height: 24px;
		--_badge-font-size: var(--text-75);
		--_badge-radius: var(--corner-radius-medium-size-small);
		--_badge-padding-inline: var(--space-2);
		--_badge-gap: 5px;
	}

	[data-spectrum-badge][data-size='M'] {
		--_badge-min-height: 32px;
		--_badge-font-size: var(--text-100);
		--_badge-radius: var(--corner-radius-medium-size-medium);
		--_badge-padding-inline: var(--space-3);
		--_badge-gap: 6px;
	}

	[data-spectrum-badge][data-size='L'] {
		--_badge-min-height: 40px;
		--_badge-font-size: var(--text-200);
		--_badge-radius: var(--corner-radius-medium-size-large);
		--_badge-padding-inline: var(--space-4);
		--_badge-gap: 7px;
	}

	[data-spectrum-badge][data-size='XL'] {
		--_badge-min-height: 48px;
		--_badge-font-size: var(--text-300);
		--_badge-radius: var(--corner-radius-medium-size-extra-large);
		--_badge-padding-inline: var(--space-5);
		--_badge-gap: 8px;
	}

	/* ══════════════════════════════════════════════════
	   Fill: bold (default)
	   bg = semantic/color token, text = white
	   Exceptions: notice, orange, yellow → text = black
	══════════════════════════════════════════════════ */

	/* --- Semantic --- */
	[data-fill='bold'][data-variant='accent'] {
		--_badge-bg: var(--accent-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='informative'] {
		--_badge-bg: var(--informative-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='neutral'] {
		--_badge-bg: var(--neutral-subdued-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='positive'] {
		--_badge-bg: var(--positive-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='notice'] {
		--_badge-bg: var(--notice-background-color-default);
		--_badge-text: black;
	}

	[data-fill='bold'][data-variant='negative'] {
		--_badge-bg: var(--negative-background-color-default);
		--_badge-text: white;
	}

	/* --- Color --- */
	[data-fill='bold'][data-variant='red'] {
		--_badge-bg: var(--negative-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='orange'] {
		--_badge-bg: var(--notice-background-color-default);
		--_badge-text: black;
	}

	[data-fill='bold'][data-variant='yellow'] {
		--_badge-bg: light-dark(var(--yellow-400), var(--yellow-1100));
		--_badge-text: black;
	}

	[data-fill='bold'][data-variant='green'] {
		--_badge-bg: var(--positive-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='blue'] {
		--_badge-bg: var(--informative-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='gray'] {
		--_badge-bg: var(--neutral-subdued-background-color-default);
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='chartreuse'] {
		--_badge-bg: light-dark(var(--chartreuse-900), var(--chartreuse-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='celery'] {
		--_badge-bg: light-dark(var(--celery-900), var(--celery-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='seafoam'] {
		--_badge-bg: light-dark(var(--seafoam-900), var(--seafoam-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='cyan'] {
		--_badge-bg: light-dark(var(--cyan-900), var(--cyan-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='indigo'] {
		--_badge-bg: light-dark(var(--indigo-900), var(--indigo-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='purple'] {
		--_badge-bg: light-dark(var(--purple-900), var(--purple-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='fuchsia'] {
		--_badge-bg: light-dark(var(--fuchsia-900), var(--fuchsia-800));
		--_badge-text: white;
	}

	[data-fill='bold'][data-variant='magenta'] {
		--_badge-bg: light-dark(var(--magenta-900), var(--magenta-800));
		--_badge-text: white;
	}

	/* ══════════════════════════════════════════════════
	   Fill: subtle
	   bg = subtle token, text = gray-1000 (uniform)
	══════════════════════════════════════════════════ */

	/* --- Semantic --- */
	[data-fill='subtle'][data-variant='accent'] {
		--_badge-bg: var(--accent-subtle-background-color-default);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='informative'] {
		--_badge-bg: var(--informative-subtle-background-color-default);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='neutral'] {
		--_badge-bg: var(--gray-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='positive'] {
		--_badge-bg: var(--positive-subtle-background-color-default);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='notice'] {
		--_badge-bg: var(--notice-subtle-background-color-default);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='negative'] {
		--_badge-bg: var(--negative-subdued-background-color-default);
		--_badge-text: var(--gray-1000);
	}

	/* --- Color --- */
	[data-fill='subtle'][data-variant='red'] {
		--_badge-bg: var(--red-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='orange'] {
		--_badge-bg: var(--orange-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='yellow'] {
		--_badge-bg: var(--yellow-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='green'] {
		--_badge-bg: var(--green-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='blue'] {
		--_badge-bg: var(--blue-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='gray'] {
		--_badge-bg: var(--gray-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='chartreuse'] {
		--_badge-bg: var(--chartreuse-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='celery'] {
		--_badge-bg: var(--celery-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='seafoam'] {
		--_badge-bg: var(--seafoam-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='cyan'] {
		--_badge-bg: var(--cyan-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='indigo'] {
		--_badge-bg: var(--indigo-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='purple'] {
		--_badge-bg: var(--purple-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='fuchsia'] {
		--_badge-bg: var(--fuchsia-100);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='subtle'][data-variant='magenta'] {
		--_badge-bg: var(--magenta-100);
		--_badge-text: var(--gray-1000);
	}

	/* ══════════════════════════════════════════════════
	   Fill: outline
	   Semantic variants ONLY (per Spectrum S2)
	   bg = layer-2, text = gray-1000, border = visual color
	══════════════════════════════════════════════════ */
	[data-fill='outline'][data-variant='accent'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--accent-visual-color);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='outline'][data-variant='informative'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--informative-visual-color);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='outline'][data-variant='neutral'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--neutral-visual-color);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='outline'][data-variant='positive'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--positive-visual-color);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='outline'][data-variant='notice'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--notice-visual-color);
		--_badge-text: var(--gray-1000);
	}

	[data-fill='outline'][data-variant='negative'] {
		--_badge-bg: var(--background-layer-2-color);
		--_badge-border: var(--negative-visual-color);
		--_badge-text: var(--gray-1000);
	}
</style>
