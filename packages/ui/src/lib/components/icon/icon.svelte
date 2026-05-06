<script lang="ts">
	import type { IconProps } from './types.js';

	const STROKE_MAP = { xs: 3, s: 2.5, m: 2, l: 2, xl: 1.75 } as const;
	const STROKE_BOLD_MAP = { xs: 4, s: 3.5, m: 3, l: 3, xl: 2.75 } as const;

	let {
		icon,
		size = 'm',
		color = 'default',
		bold = false,
		'aria-label': ariaLabel,
		class: className,
		...restProps
	}: IconProps = $props();

	let strokeWidth = $derived(bold ? STROKE_BOLD_MAP[size] : STROKE_MAP[size]);
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={ariaLabel ? 'img' : undefined}
	aria-hidden={ariaLabel ? undefined : true}
	aria-label={ariaLabel}
	data-spectrum-icon
	data-size={size}
	data-color={color !== 'default' ? color : undefined}
	class={className}
	focusable="false"
	{...restProps}
>
	{#each icon as [tag, attrs], i (i)}
		<svelte:element this={tag} {...attrs} />
	{/each}
</svg>

<style>
	[data-spectrum-icon] {
		display: inline-block;
		flex-shrink: 0;
		vertical-align: middle;
		width: var(--icon-size, var(--_icon-size));
		height: var(--icon-size, var(--_icon-size));
	}

	[data-spectrum-icon][data-size='xs'] {
		--_icon-size: 10px;
	}
	[data-spectrum-icon][data-size='s'] {
		--_icon-size: 16px;
	}
	[data-spectrum-icon][data-size='m'] {
		--_icon-size: 20px;
	}
	[data-spectrum-icon][data-size='l'] {
		--_icon-size: 22px;
	}
	[data-spectrum-icon][data-size='xl'] {
		--_icon-size: 26px;
	}

	[data-spectrum-icon][data-color='negative'] {
		color: var(--negative-visual-color);
	}
	[data-spectrum-icon][data-color='positive'] {
		color: var(--positive-visual-color);
	}
	[data-spectrum-icon][data-color='notice'] {
		color: var(--notice-visual-color);
	}
	[data-spectrum-icon][data-color='informative'] {
		color: var(--informative-visual-color);
	}
	[data-spectrum-icon][data-color='accent'] {
		color: var(--accent-visual-color);
	}
	[data-spectrum-icon][data-color='gray'] {
		color: var(--neutral-subdued-content-color-default);
	}
</style>
