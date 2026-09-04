<script lang="ts">
	import * as TableView from './index.js';

	type Row = { id: string } & Record<string, string>;

	// Two rowheader columns: a row's accessible name is both of them, and so is
	// the name of its selection checkbox.
	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'first', label: 'First', isRowHeader: true },
		{ id: 'last', label: 'Last', isRowHeader: true },
		{ id: 'role', label: 'Role' }
	];

	const ROWS: Row[] = [
		{ id: 'r0', first: 'Ada', last: 'Lovelace', role: 'Analyst' },
		{ id: 'r1', first: 'Grace', last: 'Hopper', role: 'Admiral' },
		{ id: 'r2', first: 'Alan', last: 'Turing', role: 'Fellow' }
	];

	let {
		columns = COLUMNS,
		items = ROWS,
		disabledKeys,
		disallowEmptySelection = false,
		hideHeader = false,
		selectedKeys
	}: {
		columns?: TableView.TableViewColumn[];
		items?: Row[];
		disabledKeys?: string[];
		disallowEmptySelection?: boolean;
		hideHeader?: boolean;
		/** Supplying this makes the table controlled — the spec owns the value. */
		selectedKeys?: string[];
	} = $props();
</script>

<TableView.Root
	aria-label="people"
	selectionMode="multiple"
	{disabledKeys}
	{disallowEmptySelection}
	{hideHeader}
	selectedKeys={selectedKeys ? new Set(selectedKeys) : undefined}
>
	<TableView.Header {columns} />
	<TableView.Body {items} getKey={(r) => r.id}>
		{#snippet row(item)}
			<TableView.Row>
				{#each columns as col (col.id)}
					<TableView.Cell column={col.id} textValue={item[col.id]}>{item[col.id]}</TableView.Cell>
				{/each}
			</TableView.Row>
		{/snippet}
	</TableView.Body>
</TableView.Root>
