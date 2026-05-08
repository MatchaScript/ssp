<script lang="ts">
	import { Icon, X } from '../icon/index.js';
	import type { ClearButtonProps } from './types.js';

	let {
		size = 'm',
		isDisabled = false,
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: ClearButtonProps = $props();
</script>

<!--
	ClearButton — minimal circular ×-button used inline within other controls
	(Tag, SearchField, eventually ComboBox). Mirrors React-Spectrum S2
	`ClearButton`: transparent background, color: inherit, small Cross glyph
	in a control-sized hit-target. The ×-on-coloured-bg case (e.g. tag
	emphasized + selected) inherits the parent's text colour automatically.
-->
<button
	bind:this={ref}
	type="button"
	class={className}
	data-spectrum-clear-button
	data-size={size}
	disabled={isDisabled}
	{...restProps}
>
	<Icon icon={X} size="xs" />
	{@render children?.()}
</button>

<style>
	[data-spectrum-clear-button] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		appearance: none;
		border: none;
		background-color: transparent;
		color: inherit;
		padding: 0;
		margin: 0;
		cursor: pointer;
		border-radius: var(--corner-radius-full);
		outline: none;
		position: relative;
		transition:
			color var(--duration-fast) var(--ease-default),
			transform var(--duration-fast) var(--ease-default);
	}

	/* Sizes — hit-target matches S2 `controlSize` (24/32/40/48). The Cross
	   glyph is bumped ~1.5× from S2's literal CrossIcon mapping (8/8/10/12)
	   to compensate for visual weight: S2 ships a filled custom glyph at
	   those small sizes, but we render Lucide's stroked `X` (viewBox 24,
	   stroke ~3), which is roughly half as dense at the same pixel size.
	   Both are exposed as CSS variables so a consumer can override per-
	   context if needed. */
	[data-spectrum-clear-button][data-size='xs'] {
		--clear-button-size: var(--spacing-300); /* 16px */
		--icon-size: 10px;
	}
	[data-spectrum-clear-button][data-size='s'] {
		--clear-button-size: var(--spacing-400); /* 24px */
		--icon-size: 12px;
	}
	[data-spectrum-clear-button][data-size='m'] {
		--clear-button-size: var(--spacing-500); /* 32px */
		--icon-size: 14px;
	}
	[data-spectrum-clear-button][data-size='l'] {
		--clear-button-size: var(--spacing-600); /* 40px */
		--icon-size: 16px;
	}
	[data-spectrum-clear-button][data-size='xl'] {
		--clear-button-size: var(--spacing-700); /* 48px */
		--icon-size: 18px;
	}

	/* Width is fixed (S2 controlSize), height fills the parent control's
	   inner content area (S2 `height: 'full'`). Without this, embedding
	   inside a bordered FieldGroup at min-height 32px (28px content area)
	   would push the field 4px taller. */
	[data-spectrum-clear-button] {
		width: var(--clear-button-size);
		height: 100%;
	}

	/* S2 ClearButton stays transparent in every interactive state. Press
	   feedback comes from a subtle scale-down (mirrors S2's `pressScale`).
	   Consumers add their own hover treatment via `color: inherit` when they
	   need it (Tag paints a translucent chip overlay; SearchField darkens the
	   ink). */
	[data-spectrum-clear-button]:not(:disabled):active {
		transform: scale(0.95);
	}

	[data-spectrum-clear-button]:focus-visible {
		outline: var(--focus-indicator-thickness) solid var(--focus-indicator-color);
		outline-offset: calc(var(--focus-indicator-gap) * -1);
	}

	[data-spectrum-clear-button]:disabled {
		cursor: not-allowed;
		color: var(--disabled-content-color);
	}

	@media (forced-colors: active) {
		[data-spectrum-clear-button] {
			color: ButtonText;
		}
		[data-spectrum-clear-button]:disabled {
			color: GrayText;
		}
	}
</style>
