<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Dialog from './index.js';
	import Button from '$lib/components/button/button.svelte';
	import { Icon, AlertTriangle, Trash2 } from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/Dialog',
		component: Dialog.Root,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l'] },
			isDismissible: { control: 'boolean' },
			isKeyboardDismissDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			isDismissible: false,
			isKeyboardDismissDisabled: false
		}
	});
</script>

<script lang="ts">
	let controlledOpen = $state(false);
	let formName = $state('');
	let formEmail = $state('');
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="padding-bottom: 320px;">
			<Dialog.Root
				size={args.size}
				isDismissible={args.isDismissible}
				isKeyboardDismissDisabled={args.isKeyboardDismissDisabled}
			>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="accent">Open dialog</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Heading>Review changes</Dialog.Heading>
					<Dialog.Header>You have 3 unsaved changes in this workspace.</Dialog.Header>
					<Dialog.Body>
						<p>
							Saving will update the configuration for all members. You can continue editing
							after saving.
						</p>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="secondary" treatment="outline">Cancel</Button>
							{/snippet}
						</Dialog.Close>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="accent">Save changes</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic">
	{#snippet template()}
		<div style="padding-bottom: 320px;">
			<Dialog.Root>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Show dialog</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Heading>Hello</Dialog.Heading>
					<Dialog.Body>
						<p>A minimal dialog with just a heading and body.</p>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="accent">OK</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="Destructive confirm">
	{#snippet template()}
		<div style="padding-bottom: 320px;">
			<Dialog.Root size="s">
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="negative">
							{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
							Delete workspace
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Heading>Delete workspace?</Dialog.Heading>
					<Dialog.Header>This action is permanent and cannot be undone.</Dialog.Header>
					<Dialog.Body>
						<p>
							All projects, environments, and secrets in this workspace will be deleted.
							Team members will lose access immediately.
						</p>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="secondary" treatment="outline">Cancel</Button>
							{/snippet}
						</Dialog.Close>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="negative">Delete</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="With hero">
	{#snippet template()}
		<div style="padding-bottom: 360px;">
			<Dialog.Root size="m">
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="accent">What's new</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Hero>
						<div
							style="width: 100%; height: 100%; background: linear-gradient(135deg, var(--accent-background-color-default), var(--informative-background-color-default));"
						></div>
					</Dialog.Hero>
					<Dialog.Heading>New: live collaboration</Dialog.Heading>
					<Dialog.Header>Edit configurations with your teammates in real time.</Dialog.Header>
					<Dialog.Body>
						<p>
							Invite teammates from any workspace. See cursors, presence, and edits as they
							happen.
						</p>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="secondary" treatment="outline">Later</Button>
							{/snippet}
						</Dialog.Close>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="accent">Try it</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="Form inside">
	{#snippet template()}
		<div style="padding-bottom: 360px;">
			<Dialog.Root size="m">
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Invite teammate</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Heading>Invite a teammate</Dialog.Heading>
					<Dialog.Header>They will receive an email with a join link.</Dialog.Header>
					<Dialog.Body>
						<form
							style="display: grid; gap: 12px;"
							onsubmit={(e) => e.preventDefault()}
						>
							<label style="display: grid; gap: 4px;">
								<span style="font-size: var(--text-75);">Name</span>
								<input
									bind:value={formName}
									placeholder="Ada Lovelace"
									style="padding: 8px; border: 1px solid var(--neutral-border-color-default); border-radius: 4px;"
								/>
							</label>
							<label style="display: grid; gap: 4px;">
								<span style="font-size: var(--text-75);">Email</span>
								<input
									bind:value={formEmail}
									type="email"
									placeholder="ada@example.com"
									style="padding: 8px; border: 1px solid var(--neutral-border-color-default); border-radius: 4px;"
								/>
							</label>
						</form>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="secondary" treatment="outline">Cancel</Button>
							{/snippet}
						</Dialog.Close>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="accent">Send invite</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; gap: 8px; padding-bottom: 320px;">
			{#each ['s', 'm', 'l'] as const as size}
				<Dialog.Root {size}>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button {...props}>Size {size}</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Heading>Size {size}</Dialog.Heading>
						<Dialog.Body>
							<p>Card width is fixed based on the <code>size</code> prop.</p>
						</Dialog.Body>
						<Dialog.Footer>
							<Dialog.Close>
								{#snippet child({ props })}
									<Button {...props} variant="accent">Close</Button>
								{/snippet}
							</Dialog.Close>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="Dismissible">
	{#snippet template()}
		<div style="padding-bottom: 320px;">
			<Dialog.Root isDismissible>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props}>Click backdrop to close</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.Heading>Dismissible dialog</Dialog.Heading>
					<Dialog.Header>
						Shows a close button, and the backdrop click also dismisses.
					</Dialog.Header>
					<Dialog.Body>
						<p>Use for non-critical dialogs where the user can dismiss anytime.</p>
					</Dialog.Body>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 320px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Open: <code>{controlledOpen}</code>
			</div>
			<Button onclick={() => (controlledOpen = true)}>Open externally</Button>
			<Dialog.Root open={controlledOpen} onOpenChange={(o) => (controlledOpen = o)}>
				<Dialog.Content>
					<Dialog.Heading>
						{#snippet children()}
							<span style="display: inline-flex; gap: 8px; align-items: center;">
								<Icon icon={AlertTriangle} size="m" />
								Controlled state
							</span>
						{/snippet}
					</Dialog.Heading>
					<Dialog.Body>
						<p>Open state is driven by a <code>$state</code> value in the story.</p>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="accent">Close</Button>
							{/snippet}
						</Dialog.Close>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	{/snippet}
</Story>
