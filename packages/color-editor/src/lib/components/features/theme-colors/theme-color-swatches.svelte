<script lang="ts">
	import { parse, oklch } from 'culori';

	interface ColorValue {
		name: string;
		value: string;
		contrast: number;
	}

	interface Props {
		name: string;
		values: ColorValue[];
		backgroundLightness: number;
		contrastFormula: 'wcag2' | 'wcag3';
	}

	let { name, values, backgroundLightness, contrastFormula }: Props = $props();

	const outerTextColor = $derived(backgroundLightness > 50 ? '#000' : '#fff');

	function swatchLightness(hex: string): number {
		const color = parse(hex);
		if (!color) return 0.5;
		const lch = oklch(color);
		return lch?.l ?? 0.5;
	}

	function stopLabel(valueName: string): string {
		return valueName.replace(new RegExp(`^${name}\\s*`, 'i'), '');
	}

	function formatContrast(contrast: number): string {
		if (contrastFormula === 'wcag3') {
			return `Lc ${contrast.toFixed(1)}`;
		}
		return `${contrast.toFixed(2)}:1`;
	}

	async function copyToClipboard(value: string) {
		await navigator.clipboard.writeText(value);
	}
</script>

<div class="theme-color-swatches" style:--outer-text={outerTextColor}>
	<h3 class="scale-name">{name}</h3>

	<div class="swatch-row">
		{#each values as colorValue (colorValue.name)}
			{@const l = swatchLightness(colorValue.value)}
			{@const innerText = l > 0.6 ? '#000' : '#fff'}
			{@const needsBorder = colorValue.contrast < 3}
			<button
				class="swatch"
				style:--swatch-bg={colorValue.value}
				style:--swatch-text={innerText}
				data-low-contrast={needsBorder || undefined}
				title={colorValue.value}
				onclick={() => copyToClipboard(colorValue.value)}
			>
				<span class="swatch-stop">{stopLabel(colorValue.name)}</span>
				<span class="swatch-contrast">{formatContrast(colorValue.contrast)}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.theme-color-swatches {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-100);
	}

	.scale-name {
		margin: 0;
		font-size: var(--text-200);
		font-weight: 600;
		color: var(--outer-text);
		text-transform: capitalize;
	}

	.swatch-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-75);
	}

	.swatch {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-50);
		min-height: 3rem;
		min-width: 3.5rem;
		flex: 1 1 3.5rem;
		padding: var(--spacing-75);
		background-color: var(--swatch-bg);
		color: var(--swatch-text);
		border: 1px solid transparent;
		border-radius: var(--corner-radius-100);
		cursor: pointer;
		font-family: var(--font-mono);
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.swatch:hover {
		opacity: 0.85;
	}

	.swatch:active {
		opacity: 0.7;
	}

	.swatch[data-low-contrast] {
		border-color: var(--gray-300);
	}

	.swatch-stop {
		font-size: var(--text-75);
		font-weight: 600;
	}

	.swatch-contrast {
		font-size: var(--text-50, 0.625rem);
		opacity: 0.8;
	}
</style>
