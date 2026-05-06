<script lang="ts">
	import type { DialogTriggerProps } from './types.js';
	import { getDialogContext } from './dialog.svelte.js';

	let { child: renderTrigger }: DialogTriggerProps = $props();

	const state = getDialogContext();

	const triggerProps = $derived({
		onclick: () => state.open(),
		'aria-haspopup': 'dialog' as const,
		'aria-expanded': state.isOpen,
		'aria-controls': state.dialogId
	});
</script>

{@render renderTrigger({ props: triggerProps })}
