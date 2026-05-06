<script lang="ts">
	import type { DividerRootProps } from './types.js';

	let {
		ref = $bindable(null),
		size = 'm',
		orientation = 'horizontal',
		staticColor,
		class: className = '',
		...restProps
	}: DividerRootProps = $props();
</script>

<div
	bind:this={ref}
	role="separator"
	aria-orientation={orientation}
	data-size={size}
	data-orientation={orientation}
	data-static-color={staticColor}
	class="spectrum-Divider {className}"
	{...restProps}
></div>

<style>
	.spectrum-Divider {
		/* Base appearance */
		box-sizing: border-box;
		background-color: var(--gray-200); /* Default background color */
		border-radius: var(--corner-radius-full);
	}

	.spectrum-Divider[data-size='l'] {
		background-color: var(--gray-800);
	}

	/* Size logic for horizontal orientation */
	.spectrum-Divider[data-orientation='horizontal'] {
		align-self: stretch; /* Fills parent width automatically */
	}

	.spectrum-Divider[data-orientation='horizontal'][data-size='s'] {
		height: var(--border-width-100);
	}

	.spectrum-Divider[data-orientation='horizontal'][data-size='m'] {
		height: var(--border-width-200);
	}

	.spectrum-Divider[data-orientation='horizontal'][data-size='l'] {
		height: var(--border-width-400);
	}

	/* Size logic for vertical orientation */
	.spectrum-Divider[data-orientation='vertical'] {
		align-self: stretch; /* Fills parent height automatically */
	}

	.spectrum-Divider[data-orientation='vertical'][data-size='s'] {
		width: var(--border-width-100);
	}

	.spectrum-Divider[data-orientation='vertical'][data-size='m'] {
		width: var(--border-width-200);
	}

	.spectrum-Divider[data-orientation='vertical'][data-size='l'] {
		width: var(--border-width-400);
	}

	/* Static Colors */
	.spectrum-Divider[data-static-color='black'] {
		background-color: var(--transparent-black-200);
	}
	.spectrum-Divider[data-static-color='black'][data-size='l'] {
		background-color: var(--transparent-black-800);
	}

	.spectrum-Divider[data-static-color='white'] {
		background-color: var(--transparent-white-200);
	}
	.spectrum-Divider[data-static-color='white'][data-size='l'] {
		background-color: var(--transparent-white-800);
	}
</style>
