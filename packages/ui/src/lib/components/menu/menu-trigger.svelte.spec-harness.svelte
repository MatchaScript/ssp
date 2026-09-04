<script lang="ts">
	import * as Menu from './index.js';

	let { onAction }: { onAction?: (id: string) => void } = $props();
	let consumerClicks = $state(0);
</script>

<button data-outside>outside</button>
<div data-outside-area>outside area</div>
<Menu.MenuTrigger>
	{#snippet trigger({ triggerProps })}
		<button {...triggerProps} data-trigger>Open menu</button>
	{/snippet}
	<Menu.Menu {onAction} style="min-width: 10rem">
		<Menu.MenuItem id="one" onclick={() => (consumerClicks += 1)}>One</Menu.MenuItem>
		<Menu.MenuDivider data-test-divider />
		<Menu.MenuItem id="two">Two</Menu.MenuItem>
		<Menu.MenuSection data-test-section>
			<Menu.MenuSectionHeading>Section heading</Menu.MenuSectionHeading>
			<Menu.MenuItem id="three">Three</Menu.MenuItem>
		</Menu.MenuSection>
	</Menu.Menu>
</Menu.MenuTrigger>
<output data-consumer-clicks>{consumerClicks}</output>
