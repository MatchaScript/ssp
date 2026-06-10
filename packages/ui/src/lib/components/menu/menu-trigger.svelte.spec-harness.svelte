<script lang="ts">
	import * as Menu from './index.js';

	let { onAction }: { onAction?: (id: string) => void } = $props();
</script>

<button data-outside>outside</button>
<div data-outside-area>outside area</div>
<Menu.MenuTrigger>
	{#snippet trigger({ triggerProps })}
		<button {...triggerProps} data-trigger>Open menu</button>
	{/snippet}
	<Menu.Menu {onAction}>
		<Menu.MenuItem id="one">One</Menu.MenuItem>
		<Menu.MenuItem id="two">Two</Menu.MenuItem>
	</Menu.Menu>
</Menu.MenuTrigger>
