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

	// Phase 6 column menu story state.
	// eslint-disable-next-line svelte/no-unnecessary-state-wrap -- variable is reassigned (onHiddenColumnsChange), $state is required
	let menuHidden = $state<Set<string>>(new SvelteSet());
	let menuSort = $state<SortDescriptor | undefined>();
	const menuSortedUsers = $derived(sortBy(users, menuSort));

	// Phase 6.2 column filter story state.
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
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end">Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row key={user.id}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Basic table">
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
				<TableView.Column id="status">Status</TableView.Column>
				<TableView.Column id="joined" align="end">Joined</TableView.Column>
			</TableView.Header>
			<TableView.Body>
				{#each users as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>

<Story name="Sortable">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<div
				style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Sort: <code>{sortableSort ? `${sortableSort.column} ${sortableSort.direction}` : '(none)'}</code>
			</div>
			<TableView.Root
				aria-label="Sortable table"
				sortDescriptor={sortableSort}
				onSortChange={(d) => (sortableSort = d)}
			>
				<TableView.Header>
					<TableView.Column id="name" isRowHeader allowsSorting>Name</TableView.Column>
					<TableView.Column id="email" allowsSorting>Email</TableView.Column>
					<TableView.Column id="role" allowsSorting>Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end" allowsSorting>Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each sortableUsers as user (user.id)}
						<TableView.Row key={user.id}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Multi-select">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 720px;">
			<div
				style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Selected: <code>{[...selectedUsers].join(', ') || '(none)'}</code>
			</div>
			<TableView.Root
				aria-label="Multi-select"
				selectionMode="multiple"
				selectedKeys={selectedUsers}
				onSelectionChange={(keys) => (selectedUsers = keys)}
			>
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end">Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row key={user.id}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
				<TableView.Column id="status">Status</TableView.Column>
				<TableView.Column id="joined" align="end">Joined</TableView.Column>
			</TableView.Header>
			<TableView.Body>
				{#each users as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
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
					<TableView.Header>
						<TableView.Column id="name" isRowHeader>Name</TableView.Column>
						<TableView.Column id="email">Email</TableView.Column>
						<TableView.Column id="role">Role</TableView.Column>
						<TableView.Column id="status">Status</TableView.Column>
						<TableView.Column id="joined" align="end">Joined</TableView.Column>
					</TableView.Header>
					<TableView.Body>
						{#each users.slice(0, 3) as user (user.id)}
							<TableView.Row key={user.id}>
								<TableView.Cell>{user.name}</TableView.Cell>
								<TableView.Cell>{user.email}</TableView.Cell>
								<TableView.Cell>{user.role}</TableView.Cell>
								<TableView.Cell>{user.status}</TableView.Cell>
								<TableView.Cell>{user.joined}</TableView.Cell>
							</TableView.Row>
						{/each}
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
				<TableView.Header>
					<TableView.Column id="host" isRowHeader allowsSorting>Host</TableView.Column>
					<TableView.Column id="region" allowsSorting>Region</TableView.Column>
					<TableView.Column id="cpu" align="end" allowsSorting>CPU %</TableView.Column>
					<TableView.Column id="memory" align="end" allowsSorting>Memory %</TableView.Column>
					<TableView.Column id="status" allowsSorting>Status</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each sortedServers as server (server.id)}
						<TableView.Row key={server.id}>
							<TableView.Cell>{server.host}</TableView.Cell>
							<TableView.Cell>{server.region}</TableView.Cell>
							<TableView.Cell>{server.cpu}</TableView.Cell>
							<TableView.Cell>{server.memory}</TableView.Cell>
							<TableView.Cell>{server.status}</TableView.Cell>
						</TableView.Row>
					{/each}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Empty state">
	{#snippet template()}
		<div style="width: 640px;">
			<TableView.Root aria-label="No results">
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
				</TableView.Header>
				<TableView.Body />
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
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
			</TableView.Header>
		</TableView.Root>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="width: 640px;">
		<TableView.Root aria-label="Quiet" isQuiet>
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
				<TableView.Column id="status">Status</TableView.Column>
				<TableView.Column id="joined" align="end">Joined</TableView.Column>
			</TableView.Header>
			<TableView.Body>
				{#each users.slice(0, 3) as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
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
				Click into the table or press Tab. Use ArrowUp/Down to move, Space to toggle, Shift+Arrow
				to extend, Cmd/Ctrl+A to select all, Enter to fire onAction, Escape to clear.
			</p>
			<TableView.Root
				aria-label="Keyboard nav demo"
				selectionMode="multiple"
				onAction={(k) => console.log('Action on row', k)}
			>
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end">Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row key={user.id} textValue={user.name}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
				Tab into the table to land on the first row. Press ArrowRight to enter cell mode —
				now ArrowLeft/Right move between cells, ArrowUp/Down jump rows in the same column,
				ArrowUp on the first row escapes to the column header, ArrowLeft on the first cell
				returns to row mode, Escape collapses cell mode anywhere. Enter on a sortable header
				toggles sort.
			</p>
			<TableView.Root aria-label="Cell navigation demo" selectionMode="multiple">
				<TableView.Header>
					<TableView.Column id="name" isRowHeader allowsSorting>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role" allowsSorting>Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end" allowsSorting>Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row key={user.id} textValue={user.name}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
				<TableView.Column id="status">Status</TableView.Column>
				<TableView.Column id="joined" align="end">Joined</TableView.Column>
			</TableView.Header>
			<TableView.Body>
				{#each users as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
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
			<TableView.Header>
				<TableView.Column id="name" isRowHeader>Name</TableView.Column>
				<TableView.Column id="email">Email</TableView.Column>
				<TableView.Column id="role">Role</TableView.Column>
				<TableView.Column id="status">Status</TableView.Column>
				<TableView.Column id="joined" align="end">Joined</TableView.Column>
			</TableView.Header>
			<TableView.Body>
				{#each users as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
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
				Each row is a real <code>&lt;a&gt;</code> link. Click anywhere on a row to navigate,
				cmd/ctrl/middle-click for a new tab, right-click for the browser link menu (Open in
				New Tab / Copy Link), keyboard Enter to follow.
			</p>
			<TableView.Root aria-label="Linked rows">
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="joined" align="end">Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row
							key={user.id}
							href="https://example.com/users/{user.id}"
							target="_blank"
							rel="noopener"
							textValue={user.name}
						>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
				Combination test: row click navigates, checkbox column selects, inline Button in the
				last cell fires its own onclick (and stays clickable above the row-link overlay).
			</p>
			<TableView.Root aria-label="Linked + selectable" selectionMode="multiple">
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
					<TableView.Column id="actions" align="end">Actions</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user (user.id)}
						<TableView.Row
							key={user.id}
							href="https://example.com/users/{user.id}"
							textValue={user.name}
						>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>
								<Button
									variant="secondary"
									treatment="outline"
									onclick={() => console.log('Edit', user.id)}
								>
									Edit
								</Button>
							</TableView.Cell>
						</TableView.Row>
					{/each}
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
				Linked rows ignore selection on click; non-linked rows fire <code>onAction</code> on
				double-click or Enter.
			</p>
			<TableView.Root aria-label="Mixed">
				<TableView.Header>
					<TableView.Column id="name" isRowHeader>Name</TableView.Column>
					<TableView.Column id="email">Email</TableView.Column>
					<TableView.Column id="role">Role</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each users as user, i (user.id)}
						{#if i < 3}
							<TableView.Row
								key={user.id}
								href="https://example.com/users/{user.id}"
								textValue={user.name}
							>
								<TableView.Cell>{user.name}</TableView.Cell>
								<TableView.Cell>{user.email}</TableView.Cell>
								<TableView.Cell>{user.role}</TableView.Cell>
							</TableView.Row>
						{:else}
							<TableView.Row
								key={user.id}
								textValue={user.name}
								onAction={() => console.log('Custom action for', user.id)}
							>
								<TableView.Cell>{user.name}</TableView.Cell>
								<TableView.Cell>{user.email}</TableView.Cell>
								<TableView.Cell>{user.role}</TableView.Cell>
							</TableView.Row>
						{/if}
					{/each}
				</TableView.Body>
			</TableView.Root>
		</div>
	{/snippet}
</Story>

<Story name="Column menu (sort + hide)">
	{#snippet template()}
		<div style="display: grid; gap: 12px; width: 760px;">
			<div
				style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
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
				<TableView.Header>
					<TableView.Column id="name" isRowHeader allowsSorting>Name</TableView.Column>
					<TableView.Column id="email" allowsSorting allowsHiding>Email</TableView.Column>
					<TableView.Column id="role" allowsHiding>Role</TableView.Column>
					<TableView.Column id="status" allowsHiding>Status</TableView.Column>
					<TableView.Column id="joined" align="end" allowsSorting allowsHiding>Joined</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each menuSortedUsers as user (user.id)}
						<TableView.Row key={user.id}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
			<div
				style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Active filters: <code
					>{filters.length === 0 ? '(none)' : JSON.stringify(filters)}</code
				>
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
				<TableView.Header>
					<TableView.Column id="name" isRowHeader allowsSorting filterType="text">
						Name
					</TableView.Column>
					<TableView.Column id="email" filterType="text">Email</TableView.Column>
					<TableView.Column id="role" filterType="enum" enumOptions={roleOptions}>
						Role
					</TableView.Column>
					<TableView.Column id="status" filterType="enum" enumOptions={statusOptions}>
						Status
					</TableView.Column>
					<TableView.Column id="joined" align="end" allowsSorting>
						Joined
					</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each filteredUsers as user (user.id)}
						<TableView.Row key={user.id}>
							<TableView.Cell>{user.name}</TableView.Cell>
							<TableView.Cell>{user.email}</TableView.Cell>
							<TableView.Cell>{user.role}</TableView.Cell>
							<TableView.Cell>{user.status}</TableView.Cell>
							<TableView.Cell>{user.joined}</TableView.Cell>
						</TableView.Row>
					{/each}
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
			<div
				style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Filter the CPU / Memory columns to see between-bound number filters in action.
				<br />
				Active: <code
					>{numericFilters.length === 0 ? '(none)' : JSON.stringify(numericFilters)}</code
				>
			</div>
			<TableView.Root
				aria-label="Filterable fleet"
				columnFilters={filters}
				onColumnFiltersChange={(next) => (filters = next)}
			>
				<TableView.Header>
					<TableView.Column id="host" isRowHeader filterType="text">Host</TableView.Column>
					<TableView.Column id="region" filterType="text">Region</TableView.Column>
					<TableView.Column id="cpu" align="end" filterType="number">CPU %</TableView.Column>
					<TableView.Column id="memory" align="end" filterType="number">
						Memory %
					</TableView.Column>
					<TableView.Column id="status">Status</TableView.Column>
				</TableView.Header>
				<TableView.Body>
					{#each filteredServers as server (server.id)}
						<TableView.Row key={server.id}>
							<TableView.Cell>{server.host}</TableView.Cell>
							<TableView.Cell>{server.region}</TableView.Cell>
							<TableView.Cell>{server.cpu}</TableView.Cell>
							<TableView.Cell>{server.memory}</TableView.Cell>
							<TableView.Cell>{server.status}</TableView.Cell>
						</TableView.Row>
					{/each}
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
		<TableView.Root aria-label="Hidden header">
			<TableView.Body>
				{#each users.slice(0, 3) as user (user.id)}
					<TableView.Row key={user.id}>
						<TableView.Cell>{user.name}</TableView.Cell>
						<TableView.Cell>{user.email}</TableView.Cell>
						<TableView.Cell>{user.role}</TableView.Cell>
						<TableView.Cell>{user.status}</TableView.Cell>
						<TableView.Cell>{user.joined}</TableView.Cell>
					</TableView.Row>
				{/each}
			</TableView.Body>
		</TableView.Root>
	</div>
</Story>
