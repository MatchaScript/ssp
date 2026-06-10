<script lang="ts">
	import * as TableView from './index.js';

	type Row = { id: string; a: string; b: string };

	let {
		rows,
		selectionMode = 'none' as 'none' | 'single' | 'multiple'
	}: { rows: Row[]; selectionMode?: 'none' | 'single' | 'multiple' } = $props();
</script>

<TableView.Root {selectionMode}>
	<TableView.Header>
		<TableView.Column id="a" isRowHeader defaultWidth={200}>A</TableView.Column>
		<TableView.Column id="b">B</TableView.Column>
	</TableView.Header>
	<TableView.Body>
		{#each rows as row (row.id)}
			<TableView.Row key={row.id}>
				<TableView.Cell>{row.a}</TableView.Cell>
				<TableView.Cell>{row.b}</TableView.Cell>
			</TableView.Row>
		{/each}
	</TableView.Body>
</TableView.Root>
