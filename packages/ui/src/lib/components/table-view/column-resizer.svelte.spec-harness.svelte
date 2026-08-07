<script lang="ts">
	import * as TableView from './index.js';

	let { selectionMode = 'none' as 'none' | 'single' | 'multiple' } = $props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true, allowsResizing: true, defaultWidth: 200 },
		{ id: 'b', label: 'B', allowsResizing: true },
		{ id: 'c', label: 'C' }
	];

	const rows = Array.from({ length: 3 }, (_, i) => ({
		id: `r${i}`,
		a: `a${i}`,
		b: `b${i}`,
		c: `c${i}`
	}));
</script>

<TableView.Root {selectionMode}>
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
