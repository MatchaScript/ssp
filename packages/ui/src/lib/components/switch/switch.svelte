<script lang="ts">
	import Label from '../label/label.svelte';
	import type { SwitchProps } from './types.js';

	let {
		checked = $bindable(false),
		isDisabled = false,
		size = 'm',
		isEmphasized = false,
		children,
		class: className,
		id,
		...restProps
	}: SwitchProps = $props();

	const fallbackId = $props.id();
	const switchId = $derived(id ?? fallbackId);
</script>

<div
	class={className}
	data-spectrum-switch
	data-size={size}
	data-emphasized={isEmphasized || undefined}
	data-disabled={isDisabled || undefined}
>
	<input
		id={switchId}
		type="checkbox"
		role="switch"
		bind:checked
		disabled={isDisabled}
		class="visually-hidden"
		{...restProps}
	/>
	<label for={switchId} data-spectrum-switch-track>
		<span data-spectrum-switch-handle></span>
	</label>
	{#if children}
		<Label for={switchId}>{@render children()}</Label>
	{/if}
</div>

<style>
	[data-spectrum-switch] {
		display: inline-grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		column-gap: var(--space-2);
		cursor: pointer;
		font-family: inherit;
		box-sizing: border-box;
		margin: 0;
	}

	[data-spectrum-switch][data-disabled] {
		cursor: default;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* Track styling */
	[data-spectrum-switch-track] {
		display: inline-block;
		box-sizing: border-box;
		border-radius: var(--corner-radius-full);
		border-width: var(--border-width-200);
		border-style: solid;
		transition:
			background-color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default);

		/* Default state (unchecked) */
		border-color: var(--neutral-content-color-default);
		background-color: var(--background-base-color);
	}

	/*
	 * Handle uses the perspective scaling trick from RSP S2.
	 * The handle is height:100% + aspect-ratio:1, making it a square
	 * the same size as the track height. Then perspective + translateZ
	 * visually shrinks it proportionally:
	 *   visual scale = perspective / (perspective - translateZ)
	 *
	 * Default:  handle appears (trackH - 8px) tall
	 *   perspective = trackH - 8px, translateZ = -4px
	 * Selected: handle appears (trackH - 6px) tall
	 *   perspective = 2*(trackH - 6px), translateZ = -4px
	 */
	[data-spectrum-switch-handle] {
		display: block;
		height: 100%;
		aspect-ratio: 1;
		border-radius: var(--corner-radius-full);
		background-color: var(--neutral-content-color-default);
		transition:
			transform var(--duration-fast) var(--ease-default),
			background-color var(--duration-fast) var(--ease-default);
		transform: perspective(calc(var(--track-h) - 8px)) translateZ(-4px);
	}

	/* Hover */
	[data-spectrum-switch]:hover [data-spectrum-switch-track] {
		border-color: var(--neutral-content-color-hover);
	}
	[data-spectrum-switch]:hover [data-spectrum-switch-handle] {
		background-color: var(--neutral-content-color-hover);
	}

	/* Down */
	[data-spectrum-switch]:active [data-spectrum-switch-track] {
		border-color: var(--neutral-content-color-down);
	}
	[data-spectrum-switch]:active [data-spectrum-switch-handle] {
		background-color: var(--neutral-content-color-down);
	}

	/* Checked state */
	[data-spectrum-switch]:has(input:checked) [data-spectrum-switch-track] {
		border-color: transparent;
		background-color: var(--neutral-background-color-default);
	}
	[data-spectrum-switch]:has(input:checked) [data-spectrum-switch-handle] {
		background-color: var(--background-base-color);
		transform: translateX(calc(var(--track-w) - 100% - 4px))
			perspective(calc(2 * (var(--track-h) - 6px))) translateZ(-4px);
	}

	/* Checked + Hover */
	[data-spectrum-switch]:hover:has(input:checked) [data-spectrum-switch-track] {
		background-color: var(--neutral-background-color-hover);
	}

	/* Checked + Down */
	[data-spectrum-switch]:active:has(input:checked) [data-spectrum-switch-track] {
		background-color: var(--neutral-background-color-down);
	}

	/* Emphasized checked */
	[data-spectrum-switch][data-emphasized]:has(input:checked) [data-spectrum-switch-track] {
		background-color: var(--accent-background-color-default);
	}
	[data-spectrum-switch][data-emphasized]:hover:has(input:checked) [data-spectrum-switch-track] {
		background-color: var(--accent-background-color-hover);
	}
	[data-spectrum-switch][data-emphasized]:active:has(input:checked) [data-spectrum-switch-track] {
		background-color: var(--accent-background-color-down);
	}

	/* Disabled */
	[data-spectrum-switch][data-disabled] [data-spectrum-switch-track] {
		border-color: var(--disabled-content-color);
		background-color: var(--background-base-color);
	}
	[data-spectrum-switch][data-disabled] [data-spectrum-switch-handle] {
		background-color: var(--disabled-content-color);
	}
	[data-spectrum-switch][data-disabled]:has(input:checked) [data-spectrum-switch-track] {
		border-color: transparent;
		background-color: var(--disabled-content-color);
	}
	[data-spectrum-switch][data-disabled]:has(input:checked) [data-spectrum-switch-handle] {
		background-color: var(--background-base-color);
	}

	/* Size S — track: 22×14 */
	[data-spectrum-switch][data-size='s'] {
		font-size: var(--text-75);
	}
	[data-spectrum-switch][data-size='s'] [data-spectrum-switch-track] {
		--track-w: 22px;
		--track-h: 14px;
		width: var(--track-w);
		height: var(--track-h);
	}

	/* Size M — track: 26×16 */
	[data-spectrum-switch][data-size='m'] {
		font-size: var(--text-100);
	}
	[data-spectrum-switch][data-size='m'] [data-spectrum-switch-track] {
		--track-w: 26px;
		--track-h: 16px;
		width: var(--track-w);
		height: var(--track-h);
	}

	/* Size L — track: 30×18 */
	[data-spectrum-switch][data-size='l'] {
		font-size: var(--text-200);
	}
	[data-spectrum-switch][data-size='l'] [data-spectrum-switch-track] {
		--track-w: 30px;
		--track-h: 18px;
		width: var(--track-w);
		height: var(--track-h);
	}

	/* Size XL — track: 34×20 */
	[data-spectrum-switch][data-size='xl'] {
		font-size: var(--text-300);
	}
	[data-spectrum-switch][data-size='xl'] [data-spectrum-switch-track] {
		--track-w: 34px;
		--track-h: 20px;
		width: var(--track-w);
		height: var(--track-h);
	}

	/* Focus ring */
	[data-spectrum-switch] input:focus-visible ~ [data-spectrum-switch-track] {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: var(--focus-indicator-gap);
	}
</style>
