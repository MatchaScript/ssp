<script lang="ts">
	import * as TableView from './index.js';

	type Row = { id: string; a: string; b: string; c: string };

	let {
		rows,
		selectionMode = 'multiple' as 'none' | 'single' | 'multiple',
		disabledKeys,
		withColumnFeatures = false
	}: {
		rows: Row[];
		selectionMode?: 'none' | 'single' | 'multiple';
		disabledKeys?: string[];
		withColumnFeatures?: boolean;
	} = $props();

	// Plain columns: no menu trigger, no resizer — the only focusable things are
	// the table, the rows and the cells.
	const PLAIN: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true, defaultWidth: 200 },
		{ id: 'b', label: 'B' },
		{ id: 'c', label: 'C' }
	];

	// `allowsResizing` renders the resizer AND a column menu (the menu shows up
	// for hide / filter / resize); `allowsHiding` renders a menu alone.
	const FEATURED: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'A', isRowHeader: true, defaultWidth: 200 },
		{ id: 'b', label: 'B', allowsResizing: true },
		{ id: 'c', label: 'C', allowsHiding: true }
	];

	const columns = $derived(withColumnFeatures ? FEATURED : PLAIN);
</script>

<TableView.Root aria-label="roving" {selectionMode} {disabledKeys}>
	<TableView.Header {columns} />
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
