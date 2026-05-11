<script lang="ts">
	import type { TableViewBodyProps } from './types.js';

	let { children }: TableViewBodyProps = $props();
</script>

<!-- Inside `role="grid"`, AT support is more reliable when row groups are
     marked explicitly (matches RAC / Adobe React Spectrum). -->
<!-- svelte-ignore a11y_no_redundant_roles -->
<tbody role="rowgroup" data-spectrum-table-view-body>
	{@render children?.()}
</tbody>
