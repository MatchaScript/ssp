<script lang="ts">
	import * as TableView from './index.js';

	// Which of the three label sources this table supplies. Each variant leaves
	// the ones below it in place with a different text, so a spec can tell which
	// stage answered.
	let { labelSource }: { labelSource: 'row' | 'cell' | 'dom' } = $props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'first', label: 'First', isRowHeader: true },
		{ id: 'last', label: 'Last', isRowHeader: true },
		{ id: 'role', label: 'Role' }
	];

	const ROWS = [
		{ id: 'r0', first: 'Ada', last: 'Lovelace', role: 'Analyst' },
		{ id: 'r1', first: 'Grace', last: 'Hopper', role: 'Admiral' },
		{ id: 'r2', first: 'Alan', last: 'Turing', role: 'Fellow' }
	];
</script>

<TableView.Root aria-label="labels">
	<TableView.Header columns={COLUMNS} />
	<TableView.Body items={ROWS} getKey={(r) => r.id}>
		{#snippet row(item)}
			<TableView.Row textValue={labelSource === 'row' ? `Whole row ${item.id}` : undefined}>
				<TableView.Cell column="first" textValue={labelSource === 'dom' ? undefined : item.first}>
					{item.first} rendered
				</TableView.Cell>
				<TableView.Cell column="last" textValue={labelSource === 'dom' ? undefined : item.last}>
					{item.last} rendered
				</TableView.Cell>
				<TableView.Cell column="role">{item.role}</TableView.Cell>
			</TableView.Row>
		{/snippet}
	</TableView.Body>
</TableView.Root>
