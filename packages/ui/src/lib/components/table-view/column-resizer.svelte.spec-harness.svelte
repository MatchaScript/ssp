<script lang="ts">
	import * as TableView from './index.js';

	let { selectionMode = 'none' as 'none' | 'single' | 'multiple' } = $props();

	const rows = Array.from({ length: 3 }, (_, i) => ({
		id: `r${i}`,
		a: `a${i}`,
		b: `b${i}`,
		c: `c${i}`
	}));
</script>

<TableView.Root {selectionMode}>
	<TableView.Header>
		<TableView.Column id="a" isRowHeader allowsResizing defaultWidth={200}>A</TableView.Column>
		<TableView.Column id="b" allowsResizing>B</TableView.Column>
		<TableView.Column id="c">C</TableView.Column>
	</TableView.Header>
	<TableView.Body>
		{#each rows as row (row.id)}
			<TableView.Row key={row.id}>
				<TableView.Cell>{row.a}</TableView.Cell>
				<TableView.Cell>{row.b}</TableView.Cell>
				<TableView.Cell>{row.c}</TableView.Cell>
			</TableView.Row>
		{/each}
	</TableView.Body>
</TableView.Root>
