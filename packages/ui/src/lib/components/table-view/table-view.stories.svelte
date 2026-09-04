<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteSet } from 'svelte/reactivity';
	import * as TableView from './index.js';
	import type { ColumnFilter, SortDescriptor } from './index.js';
	import { Button } from '../button/index.js';

	type User = {
		id: string;
		name: string;
		email: string;
		role: string;
		status: 'Active' | 'Away' | 'Offline';
		joined: string;
	};

	const users: User[] = [
		{
			id: '1',
			name: 'Ada Lovelace',
			email: 'ada@example.com',
			role: 'Owner',
			status: 'Active',
			joined: '2024-01-12'
		},
		{
			id: '2',
			name: 'Grace Hopper',
			email: 'grace@example.com',
			role: 'Admin',
			status: 'Active',
			joined: '2024-02-03'
		},
		{
			id: '3',
			name: 'Linus Torvalds',
			email: 'linus@example.com',
			role: 'Member',
			status: 'Away',
			joined: '2024-03-21'
		},
		{
			id: '4',
			name: 'Rich Hickey',
			email: 'rich@example.com',
			role: 'Member',
			status: 'Offline',
			joined: '2024-05-17'
		},
		{
			id: '5',
			name: 'Guido van Rossum',
			email: 'guido@example.com',
			role: 'Member',
			status: 'Active',
			joined: '2024-06-02'
		}
	];

	type Server = {
		id: string;
		host: string;
		region: string;
		cpu: number;
		memory: number;
		status: string;
	};

	const servers: Server[] = [
		{ id: 's1', host: 'api-prod-01', region: 'us-east-1', cpu: 42, memory: 61, status: 'Running' },
		{ id: 's2', host: 'api-prod-02', region: 'us-east-1', cpu: 38, memory: 54, status: 'Running' },
		{ id: 's3', host: 'api-stage-01', region: 'us-west-2', cpu: 12, memory: 33, status: 'Idle' },
		{ id: 's4', host: 'api-dev-01', region: 'eu-west-1', cpu: 0, memory: 0, status: 'Stopped' }
	];

	// Generic sort helper used by the sortable stories. Mirrors the RS Spectrum
	// example: the consumer is responsible for actually sorting their data; the
	// component just emits a SortDescriptor.
	function sortBy<T>(rows: readonly T[], desc: SortDescriptor | undefined): T[] {
		if (!desc) return [...rows];
		const dir = desc.direction === 'ascending' ? 1 : -1;
		return [...rows].sort((a, b) => {
			const av = (a as Record<string, unknown>)[desc.column];
			const bv = (b as Record<string, unknown>)[desc.column];
			if (av == null && bv == null) return 0;
			if (av == null) return -1 * dir;
			if (bv == null) return 1 * dir;
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
			return String(av).localeCompare(String(bv)) * dir;
		});
	}

	const { Story } = defineMeta({
		title: 'Components/TableView',
		component: TableView.Root,
		tags: ['autodocs'],
		argTypes: {
			density: {
				control: { type: 'inline-radio' },
				options: ['compact', 'regular', 'spacious']
			},
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['none', 'single', 'multiple']
			},
			isQuiet: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			density: 'regular',
			selectionMode: 'none',
			isQuiet: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	// eslint-disable-next-line svelte/no-unnecessary-state-wrap -- variable is reassigned (onSelectionChange), $state is required even though SvelteSet itself is reactive
	let selectedUsers = $state<Set<string>>(new SvelteSet(['2']));

	let sortableSort = $state<SortDescriptor | undefined>();
	const sortableUsers = $derived(sortBy(users, sortableSort));

	let serverSort = $state<SortDescriptor | undefined>();
	const sortedServers = $derived(sortBy(servers, serverSort));

	// Column menu story state.
	// eslint-disable-next-line svelte/no-unnecessary-state-wrap -- variable is reassigned (onHiddenColumnsChange), $state is required
	let menuHidden = $state<Set<string>>(new SvelteSet());
	let menuSort = $state<SortDescriptor | undefined>();
	const menuSortedUsers = $derived(sortBy(users, menuSort));

	// Column filter story state.
	let filters = $state<ColumnFilter[]>([]);
	let filterSort = $state<SortDescriptor | undefined>();

	// Apply each active filter against the matching column. Mirrors the sort
	// pattern: TableView only emits state, the consumer is in charge of
	// reducing the dataset. Story uses a small dispatcher so all three filter
	// types share one `$derived`.
	function applyFilters<T extends Record<string, unknown>>(
		rows: readonly T[],
		active: readonly ColumnFilter[]
	): T[] {
		if (active.length === 0) return [...rows];
		return rows.filter((row) =>
			active.every((f) => {
				const cell = row[f.column];
				if (f.type === 'text') {
					if (cell == null) return false;
					return String(cell).toLowerCase().includes(f.value.toLowerCase());
				}
				if (f.type === 'number') {
					if (typeof cell !== 'number') return false;
					if (f.value.min !== null && cell < f.value.min) return false;
					if (f.value.max !== null && cell > f.value.max) return false;
					return true;
				}
				// enum
				if (f.value.length === 0) return true;
				return f.value.includes(String(cell));
			})
		);
	}

	const filteredUsers = $derived(applyFilters(sortBy(users, filterSort), filters));

	const rows = [
		{ id: '1', a: 'Alpha', b: 'Beta', c: 'Gamma' },
		{ id: '2', a: 'Delta', b: 'Epsilon', c: 'Zeta' },
		{ id: '3', a: 'Eta', b: 'Theta', c: 'Iota' }
	];

	const roleOptions = [
		{ label: 'Owner', value: 'Owner' },
		{ label: 'Admin', value: 'Admin' },
		{ label: 'Member', value: 'Member' }
	];
	const statusOptions = [
		{ label: 'Active', value: 'Active' },
		{ label: 'Away', value: 'Away' },
		{ label: 'Offline', value: 'Offline' }
	];
	const USER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'status', label: 'Status' },
		{ id: 'joined', label: 'Joined', align: 'end' }
	];

	const SORTABLE_USER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true, allowsSorting: true },
		{ id: 'email', label: 'Email', allowsSorting: true },
		{ id: 'role', label: 'Role', allowsSorting: true },
		{ id: 'status', label: 'Status' },
		{ id: 'joined', label: 'Joined', align: 'end', allowsSorting: true }
	];

	const SORTABLE_SERVER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'host', label: 'Host', isRowHeader: true, allowsSorting: true },
		{ id: 'region', label: 'Region', allowsSorting: true },
		{ id: 'cpu', label: 'CPU %', align: 'end', allowsSorting: true },
		{ id: 'memory', label: 'Memory %', align: 'end', allowsSorting: true },
		{ id: 'status', label: 'Status', allowsSorting: true }
	];

	// Five user columns with no sort / hide affordances.
	const PLAIN_USER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'status', label: 'Status' },
		{ id: 'joined', label: 'Joined', align: 'end' }
	];

	const CELL_NAV_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true, allowsSorting: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role', allowsSorting: true },
		{ id: 'status', label: 'Status' },
		{ id: 'joined', label: 'Joined', align: 'end', allowsSorting: true }
	];

	// Stories that show the table with no rows (empty state, loading).
	const NO_DATA_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' }
	];

	const NO_USERS: User[] = [];

	const LINKED_ACTION_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'status', label: 'Status' },
		{ id: 'actions', label: 'Actions', align: 'end' }
	];

	const MIXED_ROW_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' }
	];

	const COLUMN_MENU_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true, allowsSorting: true },
		{ id: 'email', label: 'Email', allowsSorting: true, allowsHiding: true },
		{ id: 'role', label: 'Role', allowsHiding: true },
		{ id: 'status', label: 'Status', allowsHiding: true },
		{ id: 'joined', label: 'Joined', align: 'end', allowsSorting: true, allowsHiding: true }
	];

	const USER_FILTER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true, allowsSorting: true, filterType: 'text' },
		{ id: 'email', label: 'Email', filterType: 'text' },
		{ id: 'role', label: 'Role', filterType: 'enum', enumOptions: roleOptions },
		{ id: 'status', label: 'Status', filterType: 'enum', enumOptions: statusOptions },
		{ id: 'joined', label: 'Joined', align: 'end', allowsSorting: true }
	];

	const SERVER_FILTER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'host', label: 'Host', isRowHeader: true, filterType: 'text' },
		{ id: 'region', label: 'Region', filterType: 'text' },
		{ id: 'cpu', label: 'CPU %', align: 'end', filterType: 'number' },
		{ id: 'memory', label: 'Memory %', align: 'end', filterType: 'number' },
		{ id: 'status', label: 'Status' }
	];

	const HIDDEN_HEADER_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'name', label: 'Name', isRowHeader: true },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'status', label: 'Status' },
		{ id: 'joined', label: 'Joined' }
	];

	const WIDTH_COLUMNS: TableView.TableViewColumn[] = [
		{ id: 'a', label: 'Two hundred', defaultWidth: 200 },
		{ id: 'b', label: 'Two fr', defaultWidth: '2fr' },
		{ id: 'c', label: 'One fr' }
	];
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 720px;">
			<TableView.Root
				aria-label="Team"
				density={args.density}
				selectionMode={args.selectionMode}
				isQuiet={args.isQuiet}
				isDisabled={args.isDisabled}
			>
				<TableView.Header columns={USER_COLUMNS} />
				<TableView.Body items={users} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Basic table">
			<TableView.Header columns={USER_COLUMNS} />
			<TableView.Body items={users} getKey={(user) => user.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Sortable">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Sort: <code
					>{sortableSort ? `${sortableSort.column} ${sortableSort.direction}` : '(none)'}</code
				>
			</div>
			<TableView.Root
				aria-label="Sortable table"
				sortDescriptor={sortableSort}
				onSortChange={(d) => (sortableSort = d)}
			>
				<TableView.Header columns={SORTABLE_USER_COLUMNS} />
				<TableView.Body items={sortableUsers} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Multi-select">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Selected: <code>{[...selectedUsers].join(', ') || '(none)'}</code>
			</div>
			<TableView.Root
				aria-label="Multi-select"
				selectionMode="multiple"
				selectedKeys={selectedUsers}
				onSelectionChange={(keys) => (selectedUsers = keys)}
			>
				<TableView.Header columns={USER_COLUMNS} />
				<TableView.Body items={users} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Single select" asChild>
	<div style="width: 720px;">
		<TableView.Root
			aria-label="Single select"
			selectionMode="single"
			defaultSelectedKeys={new SvelteSet(['3'])}
			onAction={(k) => console.log('Action:', k)}
		>
			<TableView.Header columns={USER_COLUMNS} />
			<TableView.Body items={users} getKey={(user) => user.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Densities" asChild>
	<div style="display: grid; gap: 24px;">
		{#each ['compact', 'regular', 'spacious'] as const as density (density)}
			<div style="width: 720px;">
				<p
					style="margin: 0 0 6px; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
				>
					{density}
				</p>
				<TableView.Root aria-label="{density} density" {density}>
					<TableView.Header columns={USER_COLUMNS} />
					<TableView.Body items={users.slice(0, 3)} getKey={(user) => user.id}>
						{#snippet row(user)}
							<TableView.Row>
								<TableView.Cell column="name">{user.name}</TableView.Cell>
								<TableView.Cell column="email">{user.email}</TableView.Cell>
								<TableView.Cell column="role">{user.role}</TableView.Cell>
								<TableView.Cell column="status">{user.status}</TableView.Cell>
								<TableView.Cell column="joined">{user.joined}</TableView.Cell>
							</TableView.Row>
						{/snippet}
					</TableView.Body>
				</TableView.Root>
			</div>
		{/each}
	</div>
</Story>

<Story name="Servers (numeric columns)">
	{#snippet template()}
		<div style="width: 720px;">
			<TableView.Root
				aria-label="Fleet"
				sortDescriptor={serverSort}
				onSortChange={(d) => (serverSort = d)}
			>
				<TableView.Header columns={SORTABLE_SERVER_COLUMNS} />
				<TableView.Body items={sortedServers} getKey={(server) => server.id}>
					{#snippet row(server)}
						<TableView.Row>
							<TableView.Cell column="host">{server.host}</TableView.Cell>
							<TableView.Cell column="region">{server.region}</TableView.Cell>
							<TableView.Cell column="cpu">{server.cpu}</TableView.Cell>
							<TableView.Cell column="memory">{server.memory}</TableView.Cell>
							<TableView.Cell column="status">{server.status}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Empty state">
	{#snippet template()}
		<div style="width: 640px;">
			<TableView.Root aria-label="No results">
				<TableView.Header columns={NO_DATA_COLUMNS} />
				<TableView.Body items={NO_USERS} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
				{#snippet renderEmptyState()}
					<p style="margin: 0;">No users match the current filters.</p>
				{/snippet}
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Loading" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Loading" loadingState="loading">
			<TableView.Header columns={NO_DATA_COLUMNS} />
		</TableView.Root>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Quiet" isQuiet>
			<TableView.Header columns={PLAIN_USER_COLUMNS} />
			<TableView.Body items={users.slice(0, 3)} getKey={(user) => user.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Keyboard navigation">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<p
				style="margin: 0; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Click into the table or press Tab. Use ArrowUp/Down to move, Space to toggle, Shift+Arrow to
				extend, Cmd/Ctrl+A to select all, Enter to fire onAction, Escape to clear.
			</p>
			<TableView.Root
				aria-label="Keyboard nav demo"
				selectionMode="multiple"
				onAction={(k) => console.log('Action on row', k)}
			>
				<TableView.Header columns={PLAIN_USER_COLUMNS} />
				<TableView.Body items={users} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row textValue={user.name}>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Cell navigation (2D)">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<p
				style="margin: 0; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Tab into the table to land on the first row. Press ArrowRight to enter cell mode — now
				ArrowLeft/Right move between cells, ArrowUp/Down jump rows in the same column, ArrowUp on
				the first row escapes to the column header, ArrowLeft on the first cell returns to row mode,
				Escape collapses cell mode anywhere. Enter on a sortable header toggles sort.
			</p>
			<TableView.Root aria-label="Cell navigation demo" selectionMode="multiple">
				<TableView.Header columns={CELL_NAV_COLUMNS} />
				<TableView.Body items={users} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row textValue={user.name}>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled rows" asChild>
	<div style="width: 720px;">
		<TableView.Root
			aria-label="Disabled rows"
			selectionMode="multiple"
			disabledKeys={new Set(['3', '4'])}
		>
			<TableView.Header columns={USER_COLUMNS} />
			<TableView.Body items={users} getKey={(u) => u.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Disallow empty selection" asChild>
	<div style="width: 720px;">
		<TableView.Root
			aria-label="Disallow empty"
			selectionMode="single"
			defaultSelectedKeys={new SvelteSet(['1'])}
			disallowEmptySelection
		>
			<TableView.Header columns={USER_COLUMNS} />
			<TableView.Body items={users} getKey={(u) => u.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Rows as links">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<p
				style="margin: 0; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Each row is a real <code>&lt;a&gt;</code> link. Click anywhere on a row to navigate, cmd/ctrl/middle-click
				for a new tab, right-click for the browser link menu (Open in New Tab / Copy Link), keyboard Enter
				to follow.
			</p>
			<TableView.Root aria-label="Linked rows">
				<TableView.Header columns={USER_COLUMNS} />
				<TableView.Body items={users} getKey={(u) => u.id}>
					{#snippet row(user)}
						<TableView.Row
							href="https://example.com/users/{user.id}"
							target="_blank"
							rel="noopener"
							textValue={user.name}
						>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Linked rows with selection + inline actions">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 760px;">
			<p
				style="margin: 0; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Combination test: row click navigates, checkbox column selects, inline Button in the last
				cell fires its own onclick (and stays clickable above the row-link overlay).
			</p>
			<TableView.Root aria-label="Linked + selectable" selectionMode="multiple">
				<TableView.Header columns={LINKED_ACTION_COLUMNS} />
				<TableView.Body items={users} getKey={(u) => u.id}>
					{#snippet row(user)}
						<TableView.Row href="https://example.com/users/{user.id}" textValue={user.name}>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="actions">
								<Button
									variant="secondary"
									treatment="outline"
									onclick={() => console.log('Edit', user.id)}
								>
									Edit
								</Button>
							</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Mixed: linked + onAction rows">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<p
				style="margin: 0; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				First three rows are links; the last two have a per-row <code>onAction</code> instead.
				Linked rows ignore selection on click; non-linked rows fire <code>onAction</code> on double-click
				or Enter.
			</p>
			<TableView.Root aria-label="Mixed">
				<TableView.Header columns={MIXED_ROW_COLUMNS} />
				<TableView.Body items={users} getKey={(u) => u.id}>
					{#snippet row(user, i)}
						{#if i < 3}
							<TableView.Row href="https://example.com/users/{user.id}" textValue={user.name}>
								<TableView.Cell column="name">{user.name}</TableView.Cell>
								<TableView.Cell column="email">{user.email}</TableView.Cell>
								<TableView.Cell column="role">{user.role}</TableView.Cell>
							</TableView.Row>
						{:else}
							<TableView.Row
								textValue={user.name}
								onAction={() => console.log('Custom action for', user.id)}
							>
								<TableView.Cell column="name">{user.name}</TableView.Cell>
								<TableView.Cell column="email">{user.email}</TableView.Cell>
								<TableView.Cell column="role">{user.role}</TableView.Cell>
							</TableView.Row>
						{/if}
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Column menu (sort + hide)">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 760px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Hidden columns: <code>{[...menuHidden].join(', ') || '(none)'}</code>
				<br />
				Sort:
				<code>{menuSort ? `${menuSort.column} ${menuSort.direction}` : '(none)'}</code>
			</div>
			<TableView.Root
				aria-label="Column menu demo"
				sortDescriptor={menuSort}
				onSortChange={(d) => (menuSort = d)}
				hiddenColumns={menuHidden}
				onHiddenColumnsChange={(next) => (menuHidden = next)}
			>
				<TableView.Header columns={COLUMN_MENU_COLUMNS} />
				<TableView.Body items={menuSortedUsers} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
			{#if menuHidden.size > 0}
				<div style="display: flex; gap: 8px; flex-wrap: wrap;">
					<span
						style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default); align-self: center;"
					>
						Restore:
					</span>
					{#each [...menuHidden] as id (id)}
						<Button
							variant="secondary"
							treatment="outline"
							onclick={() => {
								const next = new SvelteSet(menuHidden);
								next.delete(id);
								menuHidden = next;
							}}
						>
							{id}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	{/snippet}
</Story>

<Story name="Column filters">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 760px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Active filters: <code>{filters.length === 0 ? '(none)' : JSON.stringify(filters)}</code>
				<br />
				Showing {filteredUsers.length} of {users.length} rows
			</div>
			<TableView.Root
				aria-label="Filterable users"
				sortDescriptor={filterSort}
				onSortChange={(d) => (filterSort = d)}
				columnFilters={filters}
				onColumnFiltersChange={(next) => (filters = next)}
			>
				<TableView.Header columns={USER_FILTER_COLUMNS} />
				<TableView.Body items={filteredUsers} getKey={(user) => user.id}>
					{#snippet row(user)}
						<TableView.Row>
							<TableView.Cell column="name">{user.name}</TableView.Cell>
							<TableView.Cell column="email">{user.email}</TableView.Cell>
							<TableView.Cell column="role">{user.role}</TableView.Cell>
							<TableView.Cell column="status">{user.status}</TableView.Cell>
							<TableView.Cell column="joined">{user.joined}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
				{#snippet renderEmptyState()}
					<p style="margin: 0;">No users match the current filters.</p>
				{/snippet}
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Numeric filters (servers)">
	{#snippet template()}
		{@const numericFilters = filters as ColumnFilter[]}
		{@const filteredServers = applyFilters(servers, numericFilters)}
		<div style="display: grid; gap: 12px; width: 760px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Filter the CPU / Memory columns to see between-bound number filters in action.
				<br />
				Active:
				<code>{numericFilters.length === 0 ? '(none)' : JSON.stringify(numericFilters)}</code>
			</div>
			<TableView.Root
				aria-label="Filterable fleet"
				columnFilters={filters}
				onColumnFiltersChange={(next) => (filters = next)}
			>
				<TableView.Header columns={SERVER_FILTER_COLUMNS} />
				<TableView.Body items={filteredServers} getKey={(server) => server.id}>
					{#snippet row(server)}
						<TableView.Row>
							<TableView.Cell column="host">{server.host}</TableView.Cell>
							<TableView.Cell column="region">{server.region}</TableView.Cell>
							<TableView.Cell column="cpu">{server.cpu}</TableView.Cell>
							<TableView.Cell column="memory">{server.memory}</TableView.Cell>
							<TableView.Cell column="status">{server.status}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
				{#snippet renderEmptyState()}
					<p style="margin: 0;">No servers match the current filters.</p>
				{/snippet}
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Hidden header" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Hidden header" hideHeader>
			<TableView.Header columns={HIDDEN_HEADER_COLUMNS} />
			<TableView.Body items={users.slice(0, 3)} getKey={(user) => user.id}>
				{#snippet row(user)}
					<TableView.Row>
						<TableView.Cell column="name">{user.name}</TableView.Cell>
						<TableView.Cell column="email">{user.email}</TableView.Cell>
						<TableView.Cell column="role">{user.role}</TableView.Cell>
						<TableView.Cell column="status">{user.status}</TableView.Cell>
						<TableView.Cell column="joined">{user.joined}</TableView.Cell>
					</TableView.Row>
				{/snippet}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="WithColumnWidths">
	{#snippet template(args)}
		<!-- Strip Storybook's auto-injected `children` from `args` before spread to
		     avoid a duplicate-children compile error on the inner TableView.Root. -->
		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{@const { children: _children, ...rest } = args}
		<div style="width: 720px;">
			<TableView.Root aria-label="Column widths" selectionMode="none" {...rest}>
				<TableView.Header columns={WIDTH_COLUMNS} />
				<TableView.Body items={rows} getKey={(item) => item.id}>
					{#snippet row(item)}
						<TableView.Row>
							<TableView.Cell column="a">{item.a}</TableView.Cell>
							<TableView.Cell column="b">{item.b}</TableView.Cell>
							<TableView.Cell column="c">{item.c}</TableView.Cell>
						</TableView.Row>
					{/snippet}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>
