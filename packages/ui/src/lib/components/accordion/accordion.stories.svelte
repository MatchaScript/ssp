<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Accordion from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Accordion',
		component: Accordion.Root,
		tags: ['autodocs'],
		argTypes: {
			type: { control: { type: 'inline-radio' }, options: ['single', 'multiple'] },
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l', 'xl'] },
			density: { control: { type: 'inline-radio' }, options: ['compact', 'regular', 'spacious'] },
			isQuiet: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			type: 'single',
			size: 'm',
			density: 'regular',
			isQuiet: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let controlledValue = $state<string | string[]>('billing');
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 480px;">
			<Accordion.Root
				type={args.type}
				size={args.size}
				density={args.density}
				isQuiet={args.isQuiet}
				isDisabled={args.isDisabled}
				value="faq-1"
			>
				<Accordion.Item value="faq-1">
					<Accordion.Header><Accordion.Trigger>What is SSP?</Accordion.Trigger></Accordion.Header>
					<Accordion.Content>
						SSP is a Spectrum-inspired design system toolkit for Svelte 5.
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="faq-2">
					<Accordion.Header
						><Accordion.Trigger>How do I install it?</Accordion.Trigger></Accordion.Header
					>
					<Accordion.Content>
						Run <code>npm install @matchalatte/ssp-ui</code> and import components from
						<code>@matchalatte/ssp-ui/components/*</code>.
					</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="faq-3">
					<Accordion.Header
						><Accordion.Trigger>Does it support dark mode?</Accordion.Trigger></Accordion.Header
					>
					<Accordion.Content>
						Yes, via CSS custom properties and the <code>light-dark()</code> function.
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	{/snippet}
</Story>

<Story name="Single open" asChild>
	<div style="width: 480px;">
		<Accordion.Root type="single" value="general">
			<Accordion.Item value="general">
				<Accordion.Header><Accordion.Trigger>General</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Profile, email, time zone.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="notifications">
				<Accordion.Header><Accordion.Trigger>Notifications</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Email frequency, in-app alerts.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="billing">
				<Accordion.Header><Accordion.Trigger>Billing</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Payment method, invoices, plan.</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Story>

<Story name="Multiple open" asChild>
	<div style="width: 480px;">
		<Accordion.Root type="multiple" value={['general', 'billing']}>
			<Accordion.Item value="general">
				<Accordion.Header><Accordion.Trigger>General</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Profile, email, time zone.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="notifications">
				<Accordion.Header><Accordion.Trigger>Notifications</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Email frequency, in-app alerts.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="billing">
				<Accordion.Header><Accordion.Trigger>Billing</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Payment method, invoices, plan.</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="width: 480px;">
		<Accordion.Root isQuiet value="a">
			<Accordion.Item value="a">
				<Accordion.Header><Accordion.Trigger>No dividers</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>
					<code>isQuiet</code> removes the separator between items.
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="b">
				<Accordion.Header><Accordion.Trigger>Useful in cards</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>When the container already has chrome.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="c">
				<Accordion.Header><Accordion.Trigger>Minimal chrome</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Retains the trigger background on hover.</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: grid; gap: 24px; width: 520px;">
		{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
			<Accordion.Root {size} value="a">
				<Accordion.Item value="a">
					<Accordion.Header>
						<Accordion.Trigger>Size {size}</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Content>Content at size {size}.</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="b">
					<Accordion.Header>
						<Accordion.Trigger>Second item</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Content>More content.</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		{/each}
	</div>
</Story>

<Story name="Long content" asChild>
	<div style="width: 560px;">
		<Accordion.Root value="terms">
			<Accordion.Item value="terms">
				<Accordion.Header><Accordion.Trigger>Terms of service</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
						incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
						exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
					</p>
					<p>
						Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
						nulla pariatur. Excepteur sint occaecat cupidatat non proident.
					</p>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="privacy">
				<Accordion.Header><Accordion.Trigger>Privacy policy</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Short summary here.</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Open: <code>{String(controlledValue)}</code>
			</div>
			<Accordion.Root
				type="single"
				value={controlledValue as string}
				onValueChange={(v) => (controlledValue = v)}
			>
				<Accordion.Item value="general">
					<Accordion.Header><Accordion.Trigger>General</Accordion.Trigger></Accordion.Header>
					<Accordion.Content>Profile, email, time zone.</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="notifications">
					<Accordion.Header><Accordion.Trigger>Notifications</Accordion.Trigger></Accordion.Header>
					<Accordion.Content>Email frequency, in-app alerts.</Accordion.Content>
				</Accordion.Item>
				<Accordion.Item value="billing">
					<Accordion.Header><Accordion.Trigger>Billing</Accordion.Trigger></Accordion.Header>
					<Accordion.Content>Payment method, invoices, plan.</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled" asChild>
	<div style="width: 480px;">
		<Accordion.Root isDisabled value="a">
			<Accordion.Item value="a">
				<Accordion.Header
					><Accordion.Trigger>Can't open (root disabled)</Accordion.Trigger></Accordion.Header
				>
				<Accordion.Content>Hidden.</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="b">
				<Accordion.Header><Accordion.Trigger>Also disabled</Accordion.Trigger></Accordion.Header>
				<Accordion.Content>Hidden.</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>
	</div>
</Story>
