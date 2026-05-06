<script lang="ts">
	import type { DialogCloseProps } from './types.js';
	import { getDialogContext } from './dialog.svelte.js';

	let { child: renderClose }: DialogCloseProps = $props();

	const state = getDialogContext();

	const closeProps = $derived({
		onclick: () => state.close()
	});
</script>

{@render renderClose({ props: closeProps })}
