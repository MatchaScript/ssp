<script lang="ts">
	import type { DialogRootProps } from './types.js';
	import { DialogState, setDialogContext } from './dialog.svelte.js';

	let {
		size = 'm',
		isDismissible = false,
		isKeyboardDismissDisabled = false,
		open = $bindable(false),
		onOpenChange,
		children
	}: DialogRootProps = $props();

	const dialogState = new DialogState({
		get size() {
			return size;
		},
		get isDismissible() {
			return isDismissible;
		},
		get isKeyboardDismissDisabled() {
			return isKeyboardDismissDisabled;
		},
		get isOpen() {
			return open;
		},
		requestOpen() {
			if (open) return;
			open = true;
			onOpenChange?.(true);
		},
		requestClose() {
			if (!open) return;
			open = false;
			onOpenChange?.(false);
		}
	});

	setDialogContext(dialogState);
</script>

{@render children()}
