<script lang="ts">
	import type { ColorEntry } from '$lib/types/spectrum-config';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Badge } from '@matchalatte/ssp-ui';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		color: ColorEntry;
		isAccent?: boolean;
	};

	let { color, isAccent = false }: Props = $props();

	const href = $derived(resolve('/(app)/create/[color]', { color: color.name }));
	const isActive = $derived(
		page.url?.pathname === href || page.url?.pathname.startsWith(href + '/') || false
	);

	const anchors = $derived(
		Object.entries(color.scaleAnchors).sort(([a], [b]) => Number(a) - Number(b))
	);
</script>

<a class="color-list-item" {href} data-active={isActive || undefined}>
	<div class="color-swatch-base" style="background-color: {color.baseHex}"></div>

	<div class="color-info">
		<span class="color-name">
			{color.name}
			{#if isAccent}
				<Badge variant="informative" size="S">{m.create_accent()}</Badge>
			{/if}
		</span>
		<span class="color-meta">
			<span class="color-anchors">
				{#each anchors as [level, hex] (level)}
					<span class="color-anchor-swatch" style="background-color: {hex}" title="{level}: {hex}"
					></span>
				{/each}
			</span>
			<span class="color-hex">{color.baseHex}</span>
		</span>
	</div>
</a>

<style>
	.color-list-item {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--spacing-200);
		padding: var(--spacing-100) var(--spacing-200);
		border-radius: var(--corner-radius-100);
		text-decoration: none;
		color: inherit;
		transition: background-color var(--duration-fast) var(--ease-default);
	}

	.color-list-item:hover {
		background-color: var(--gray-100);
	}

	.color-list-item[data-active] {
		background-color: light-dark(var(--gray-200), var(--gray-400));
	}

	.color-list-item[data-active]:hover {
		background-color: light-dark(var(--gray-300), var(--gray-500));
	}

	.color-swatch-base {
		width: 2rem;
		height: 2rem;
		border-radius: var(--corner-radius-200);
		border: 1px solid var(--gray-200);
		flex-shrink: 0;
	}

	.color-info {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-75);
		min-width: 0;
	}

	.color-name {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
		font-size: var(--text-100);
		font-weight: 600;
		color: var(--neutral-content-color-default);
		text-transform: capitalize;
	}

	.color-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-200);
	}

	.color-anchors {
		display: flex;
		gap: 2px;
		width: 100%;
		max-width: 10rem;
	}

	.color-anchor-swatch {
		flex: 1 1 0;
		min-width: 4px;
		max-width: 1rem;
		height: 0.75rem;
		border-radius: 2px;
	}

	.color-anchor-swatch:first-child {
		border-radius: var(--corner-radius-100) 2px 2px var(--corner-radius-100);
	}

	.color-anchor-swatch:last-child {
		border-radius: 2px var(--corner-radius-100) var(--corner-radius-100) 2px;
	}

	.color-hex {
		font-size: var(--text-75);
		color: var(--neutral-subdued-content-color-default);
		font-family: var(--font-mono);
	}
</style>
