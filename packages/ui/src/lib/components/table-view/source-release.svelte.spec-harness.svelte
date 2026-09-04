<script lang="ts">
	import * as TableView from './index.js';

	let { showHeader = true, showBody = true }: { showHeader?: boolean; showBody?: boolean } =
		$props();

	const COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true },
		{ id: 'b', label: 'B' }
	];

	const rows = [
		{ id: 'r0', a: 'a0', b: 'b0' },
		{ id: 'r1', a: 'a1', b: 'b1' },
		{ id: 'r2', a: 'a2', b: 'b2' }
	];
</script>

<!-- Root renders this only while it reports no rows, so its arrival is an
     observation of the row source rather than of the markup. -->
{#snippet renderEmptyState()}
	Nothing here
{/snippet}

<TableView.Root aria-label="release" selectionMode="multiple" {renderEmptyState}>
	{#if showHeader}
		<TableView.Header columns={COLUMNS} />
	{/if}
	{#if showBody}
		<TableView.Body items={rows} getKey={(r) => r.id}>
			{#snippet row(item)}
				<TableView.Row>
					<TableView.Cell column="a">{item.a}</TableView.Cell>
					<TableView.Cell column="b">{item.b}</TableView.Cell>
				</TableView.Row>
			{/snippet}
		</TableView.Body>
	{/if}
</TableView.Root>
