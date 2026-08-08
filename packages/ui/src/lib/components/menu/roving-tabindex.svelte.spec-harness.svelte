<script lang="ts">
	import * as Menu from './index.js';
	import type { SelectionMode } from './menu.svelte.js';

	let {
		showThird = true,
		selectionMode = 'none'
	}: { showThird?: boolean; selectionMode?: SelectionMode } = $props();
</script>

<button data-outside>outside</button>
<Menu.Menu {selectionMode} data-testid="menu">
	<Menu.MenuItem id="one" data-testid="one">One</Menu.MenuItem>
	<Menu.MenuItem id="two" isDisabled data-testid="two">Two</Menu.MenuItem>
	{#if showThird}
		<Menu.MenuItem id="three" data-testid="three">Three</Menu.MenuItem>
	{/if}
	<Menu.MenuItem id="four" data-testid="four">Four</Menu.MenuItem>
</Menu.Menu>
