<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as M from './index.js';
	import { Button } from '../button/index.js';
	import { Icon, Copy, Edit, Save, Settings, Trash2, ExternalLink } from '../icon/index.js';

	const { Story } = defineMeta({
		title: 'Components/Menu',
		component: M.Menu,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			selectionMode: {
				control: { type: 'inline-radio' },
				options: ['none', 'single', 'multiple']
			}
		},
		args: {
			size: 'm',
			selectionMode: 'none'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 320px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Open menu</Button>
				{/snippet}
				<M.Menu
					size={args.size}
					selectionMode={args.selectionMode}
					selectedKeys={new Set(['save'])}
					onAction={(id) => console.log('Action:', id)}
					onSelectionChange={(keys) => console.log('Selected:', [...keys])}
				>
					<M.MenuItem id="save" shortcut="⌘S" description="Write current state to disk">
						{#snippet icon()}<Icon icon={Save} size={args.size} />{/snippet}
						Save
					</M.MenuItem>
					<M.MenuItem id="copy" shortcut="⌘C">
						{#snippet icon()}<Icon icon={Copy} size={args.size} />{/snippet}
						Copy
					</M.MenuItem>
					<M.MenuItem id="edit" shortcut="⌘E" value="Last edited today">
						{#snippet icon()}<Icon icon={Edit} size={args.size} />{/snippet}
						Edit
					</M.MenuItem>
					<M.MenuDivider />
					<M.MenuItem id="settings">
						{#snippet icon()}<Icon icon={Settings} size={args.size} />{/snippet}
						Settings
					</M.MenuItem>
					<M.MenuItem id="delete" shortcut="⌫" isDisabled>
						{#snippet icon()}<Icon icon={Trash2} size={args.size} />{/snippet}
						Delete
					</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Open Menu</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="profile">Profile</M.MenuItem>
					<M.MenuItem id="billing">Billing</M.MenuItem>
					<M.MenuItem id="team">Team</M.MenuItem>
					<M.MenuDivider />
					<M.MenuItem id="settings">Settings</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="With icons and shortcuts">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>File</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="save" shortcut="⌘S">
						{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
						Save
					</M.MenuItem>
					<M.MenuItem id="copy" shortcut="⌘C">
						{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
						Copy
					</M.MenuItem>
					<M.MenuItem id="edit" shortcut="⌘E">
						{#snippet icon()}<Icon icon={Edit} size="m" />{/snippet}
						Edit
					</M.MenuItem>
					<M.MenuDivider />
					<M.MenuItem id="delete" shortcut="⌫" isDisabled>
						{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
						Delete
					</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="With description">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Export</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="png" description="Lossless, large file">
						{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
						PNG
					</M.MenuItem>
					<M.MenuItem id="jpeg" description="Compressed, smaller file">
						{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
						JPEG
					</M.MenuItem>
					<M.MenuItem id="open-site" description="Opens documentation in a new tab">
						{#snippet icon()}<Icon icon={ExternalLink} size="m" />{/snippet}
						Open docs
					</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="With value">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Preferences</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="theme" value="Dark">
						{#snippet icon()}<Icon icon={Settings} size="m" />{/snippet}
						Theme
					</M.MenuItem>
					<M.MenuItem id="language" value="English">
						{#snippet icon()}<Icon icon={Settings} size="m" />{/snippet}
						Language
					</M.MenuItem>
					<M.MenuItem id="density" value="Compact">
						{#snippet icon()}<Icon icon={Settings} size="m" />{/snippet}
						Density
					</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Sections">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 320px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Actions</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuSection>
						<M.MenuSectionHeading>File</M.MenuSectionHeading>
						<M.MenuItem id="save" shortcut="⌘S">
							{#snippet icon()}<Icon icon={Save} size="m" />{/snippet}
							Save
						</M.MenuItem>
						<M.MenuItem id="copy" shortcut="⌘C">
							{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
							Copy
						</M.MenuItem>
					</M.MenuSection>
					<M.MenuSection>
						<M.MenuSectionHeading>Danger zone</M.MenuSectionHeading>
						<M.MenuItem id="delete" shortcut="⌫">
							{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
							Delete
						</M.MenuItem>
					</M.MenuSection>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Selection — single">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Sort by</Button>
				{/snippet}
				<M.Menu
					selectionMode="single"
					selectedKeys={new Set(['name'])}
					onSelectionChange={(keys) => console.log('Selected:', [...keys])}
				>
					<M.MenuItem id="name">Name</M.MenuItem>
					<M.MenuItem id="date">Date modified</M.MenuItem>
					<M.MenuItem id="size">Size</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Selection — multiple">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Columns</Button>
				{/snippet}
				<M.Menu
					selectionMode="multiple"
					selectedKeys={new Set(['name', 'date'])}
					onSelectionChange={(keys) => console.log('Selected:', [...keys])}
				>
					<M.MenuItem id="name">Name</M.MenuItem>
					<M.MenuItem id="date">Date modified</M.MenuItem>
					<M.MenuItem id="size">Size</M.MenuItem>
					<M.MenuItem id="kind">Kind</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Links">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 240px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Help</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="docs" href="https://svelte.dev" target="_blank">
						{#snippet icon()}<Icon icon={ExternalLink} size="m" />{/snippet}
						Svelte docs
					</M.MenuItem>
					<M.MenuItem id="home" href="/">Back to home</M.MenuItem>
					<M.MenuItem id="issues" href="https://github.com" target="_blank" hideLinkOutIcon>
						GitHub (no auto icon)
					</M.MenuItem>
					<M.MenuItem id="blocked" href="https://example.com" isDisabled>Disabled link</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Submenu">
	{#snippet template()}
		<div
			style="display: flex; flex-direction: column; align-items: start; gap: 8px; padding-bottom: 320px;"
		>
			<M.MenuTrigger>
				{#snippet trigger({ triggerProps })}
					<Button {...triggerProps}>Edit</Button>
				{/snippet}
				<M.Menu onAction={(id) => console.log('Action:', id)}>
					<M.MenuItem id="undo" shortcut="⌘Z">Undo</M.MenuItem>
					<M.MenuItem id="redo" shortcut="⌘⇧Z">Redo</M.MenuItem>
					<M.MenuDivider />
					<M.SubmenuTrigger>
						<M.MenuItem id="transform">Transform</M.MenuItem>
						<M.Menu onAction={(id) => console.log('Action:', id)}>
							<M.MenuItem id="rotate-cw">Rotate clockwise</M.MenuItem>
							<M.MenuItem id="rotate-ccw">Rotate counter-clockwise</M.MenuItem>
							<M.MenuItem id="flip-h">Flip horizontal</M.MenuItem>
							<M.MenuItem id="flip-v">Flip vertical</M.MenuItem>
						</M.Menu>
					</M.SubmenuTrigger>
					<M.SubmenuTrigger>
						<M.MenuItem id="share">Share</M.MenuItem>
						<M.Menu onAction={(id) => console.log('Action:', id)}>
							<M.MenuItem id="share-link">Copy link</M.MenuItem>
							<M.MenuItem id="share-email">Send via email</M.MenuItem>
							<M.SubmenuTrigger>
								<M.MenuItem id="share-export">Export as</M.MenuItem>
								<M.Menu onAction={(id) => console.log('Action:', id)}>
									<M.MenuItem id="export-png">PNG</M.MenuItem>
									<M.MenuItem id="export-svg">SVG</M.MenuItem>
									<M.MenuItem id="export-pdf">PDF</M.MenuItem>
								</M.Menu>
							</M.SubmenuTrigger>
						</M.Menu>
					</M.SubmenuTrigger>
					<M.MenuDivider />
					<M.MenuItem id="delete" isDisabled>Delete</M.MenuItem>
				</M.Menu>
			</M.MenuTrigger>
		</div>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 16px; padding-bottom: 240px;">
			{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
				<M.MenuTrigger>
					{#snippet trigger({ triggerProps })}
						<Button {...triggerProps}>Size {size}</Button>
					{/snippet}
					<M.Menu {size} onAction={(id) => console.log('Action:', id)}>
						<M.MenuItem id="save" shortcut="⌘S">
							{#snippet icon()}<Icon icon={Save} {size} />{/snippet}
							Save
						</M.MenuItem>
						<M.MenuItem id="copy" shortcut="⌘C">
							{#snippet icon()}<Icon icon={Copy} {size} />{/snippet}
							Copy
						</M.MenuItem>
					</M.Menu>
				</M.MenuTrigger>
			{/each}
		</div>
	{/snippet}
</Story>
