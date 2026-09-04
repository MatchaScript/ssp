<script lang="ts">
	import * as TableView from './index.js';

	type Row = { id: string; a: string; b: string; c: string };

	let {
		rows,
		selectionMode = 'none' as 'none' | 'single' | 'multiple',
		hiddenColumns
	}: {
		rows: Row[];
		selectionMode?: 'none' | 'single' | 'multiple';
		hiddenColumns?: string[];
	} = $props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true, defaultWidth: 200 },
		{ id: 'b', label: 'B' },
		{ id: 'c', label: 'C' }
	];
</script>

<TableView.Root {selectionMode} {hiddenColumns}>
	<TableView.Header columns={COLUMNS} />
	<TableView.Body items={rows} getKey={(r) => r.id}>
		{#snippet row(item)}
			<TableView.Row>
				<TableView.Cell column="a">{item.a}</TableView.Cell>
				<TableView.Cell column="b">{item.b}</TableView.Cell>
				<TableView.Cell column="c">{item.c}</TableView.Cell>
			</TableView.Row>
		{/snippet}
	</TableView.Body>
</TableView.Root>
