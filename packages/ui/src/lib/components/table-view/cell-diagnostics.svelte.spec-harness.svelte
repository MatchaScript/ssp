<script lang="ts">
	import * as TableView from './index.js';

	let { duplicate = false }: { duplicate?: boolean } = $props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true },
		{ id: 'b', label: 'B' }
	];

	const rows = [{ id: 'r0', a: 'a0', b: 'b0' }];
</script>

<TableView.Root aria-label="diagnostics">
	<TableView.Header columns={COLUMNS} />
	<TableView.Body items={rows} getKey={(r) => r.id}>
		{#snippet row(item)}
			<TableView.Row>
				<TableView.Cell column="a">{item.a}</TableView.Cell>
				{#if duplicate}
					<TableView.Cell column="a">{item.a}</TableView.Cell>
				{:else}
					<TableView.Cell column="typo">{item.b}</TableView.Cell>
				{/if}
			</TableView.Row>
		{/snippet}
	</TableView.Body>
</TableView.Root>
