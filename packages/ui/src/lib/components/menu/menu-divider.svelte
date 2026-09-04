<script lang="ts">
	import { Divider } from '../divider/index.js';
	import type { MenuDividerProps } from './types.js';

	let { ref = $bindable(null), ...restProps }: MenuDividerProps = $props();
</script>

<Divider {...restProps} bind:ref size="m" data-spectrum-menu-divider />

<style>
	:global([data-spectrum-menu-divider]) {
		grid-column: 2 / -2;
		display: block;
		margin-block: var(--spacing-75);
	}
</style>
