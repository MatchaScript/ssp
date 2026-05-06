<script lang="ts">
	import type { ColorEntry } from '$lib/types/spectrum-config';
	import { m } from '$lib/paraglide/messages';
	import ColorListItem from './color-list-item.svelte';

	type Props = {
		colors: ColorEntry[];
		accentColor: string;
	};

	let { colors, accentColor }: Props = $props();
</script>

<div class="color-list" role="list" aria-label={m.create_color_list()}>
	{#if colors.length === 0}
		<p class="color-list-empty">{m.create_no_colors()}</p>
	{:else}
		{#each colors as color (color.name)}
			<div role="listitem">
				<ColorListItem {color} isAccent={color.name === accentColor} />
			</div>
		{/each}
	{/if}
</div>

<style>
	.color-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-75);
	}

	.color-list-empty {
		font-size: var(--text-100);
		color: var(--neutral-subdued-content-color-default);
		text-align: center;
		padding: var(--spacing-00);
		margin: 0;
	}
</style>
