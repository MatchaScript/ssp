<script lang="ts">
	import { Divider } from '../divider/index.js';
</script>

<div data-spectrum-menu-divider role="separator">
	<Divider size="m" />
</div>

<style>
	[data-spectrum-menu-divider] {
		grid-column: 2 / -2;
		display: block;
		margin-block: var(--spacing-75);
	}
</style>
