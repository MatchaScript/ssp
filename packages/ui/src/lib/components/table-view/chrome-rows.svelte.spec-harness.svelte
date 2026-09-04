<script lang="ts">
	import * as TableView from './index.js';

	let {
		rows,
		loadingState = 'idle' as TableView.TableViewLoadingState
	}: {
		rows: { id: string; a: string; b: string }[];
		loadingState?: TableView.TableViewLoadingState;
	} = $props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true },
		{ id: 'b', label: 'B' }
	];
</script>

{#snippet renderEmptyState()}
	Nothing here
{/snippet}

<TableView.Root aria-label="chrome" selectionMode="multiple" {loadingState} {renderEmptyState}>
	<TableView.Header columns={COLUMNS} />
	<TableView.Body items={rows} getKey={(r) => r.id}>
		{#snippet row(item)}
			<TableView.Row>
				<TableView.Cell column="a">{item.a}</TableView.Cell>
				<TableView.Cell column="b">{item.b}</TableView.Cell>
			</TableView.Row>
		{/snippet}
	</TableView.Body>
</TableView.Root>
