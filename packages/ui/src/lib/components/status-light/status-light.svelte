<script lang="ts">
	import type { StatusLightRootProps } from './types.js';

	let {
		ref = $bindable(null),
		children,
		variant = 'neutral',
		size = 'm',
		class: className = '',
		...restProps
	}: StatusLightRootProps = $props();
</script>

<div
	bind:this={ref}
	data-spectrum-status-light
	data-variant={variant}
	data-size={size}
	class={className}
	{...restProps}
>
	{@render children?.()}
</div>

<style>
	[data-spectrum-status-light] {
		display: inline-flex;
		align-items: center;
		box-sizing: border-box;

		/* Default typography */
		font-family: var(--font-sans);
		font-style: normal;
		font-weight: 500;
		line-height: var(--lh-component);

		color: var(--gray-800);
	}

	[data-spectrum-status-light]::before {
		content: '';
		box-sizing: border-box;
		display: inline-block;
		flex-grow: 0;
		flex-shrink: 0;
		border-radius: var(--corner-radius-full);
	}

	/* CSS mappings per size */
	[data-spectrum-status-light][data-size='s'] {
		font-size: var(--text-75);
		min-block-size: 24px;
		gap: 6px;

		&::before {
			inline-size: 8px;
			block-size: 8px;
		}
	}

	[data-spectrum-status-light][data-size='m'] {
		font-size: var(--text-100);
		min-block-size: 32px;
		gap: 8px;

		&::before {
			inline-size: 10px;
			block-size: 10px;
		}
	}

	[data-spectrum-status-light][data-size='l'] {
		font-size: var(--text-200);
		min-block-size: 40px;
		gap: 10px;

		&::before {
			inline-size: 12px;
			block-size: 12px;
		}
	}

	[data-spectrum-status-light][data-size='xl'] {
		font-size: var(--text-300);
		min-block-size: 48px;
		gap: 12px;

		&::before {
			inline-size: 14px;
			block-size: 14px;
		}
	}

	/* Semantic Variants */
	[data-spectrum-status-light][data-variant='neutral']::before {
		background-color: var(--neutral-visual-color);
	}
	[data-spectrum-status-light][data-variant='informative']::before {
		background-color: var(--informative-visual-color);
	}
	[data-spectrum-status-light][data-variant='positive']::before {
		background-color: var(--positive-visual-color);
	}
	[data-spectrum-status-light][data-variant='negative']::before {
		background-color: var(--negative-visual-color);
	}
	[data-spectrum-status-light][data-variant='notice']::before {
		background-color: var(--notice-visual-color);
	}

	/* Disabled State */
	[data-spectrum-status-light].is-disabled {
		color: var(--disabled-content-color);
	}

	[data-spectrum-status-light].is-disabled::before {
		background-color: var(--disabled-background-color);
	}
</style>
