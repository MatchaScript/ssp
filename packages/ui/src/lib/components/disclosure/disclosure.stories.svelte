<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Disclosure from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Disclosure',
		component: Disclosure.Root,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l', 'xl'] },
			density: { control: { type: 'inline-radio' }, options: ['compact', 'regular', 'spacious'] },
			isQuiet: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			density: 'regular',
			isQuiet: false,
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let controlledOpen = $state(true);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 480px;">
			<Disclosure.Root
				size={args.size}
				density={args.density}
				isQuiet={args.isQuiet}
				isDisabled={args.isDisabled}
				open
			>
				<Disclosure.Trigger>Advanced options</Disclosure.Trigger>
				<Disclosure.Content>
					Fine-tune retry, timeout, and caching behavior for this request.
				</Disclosure.Content>
			</Disclosure.Root>
		</div>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<div style="width: 480px;">
		<Disclosure.Root>
			<Disclosure.Trigger>Show more details</Disclosure.Trigger>
			<Disclosure.Content>
				Content that is revealed when the disclosure is expanded.
			</Disclosure.Content>
		</Disclosure.Root>
	</div>
</Story>

<Story name="FAQ group" asChild>
	<div style="display: grid; gap: 0; width: 560px;">
		<Disclosure.Root>
			<Disclosure.Trigger>What is SSP?</Disclosure.Trigger>
			<Disclosure.Content>
				A Spectrum-inspired design system toolkit for Svelte 5 — UI library, token
				generator, and palette editor.
			</Disclosure.Content>
		</Disclosure.Root>
		<Disclosure.Root>
			<Disclosure.Trigger>How do I install it?</Disclosure.Trigger>
			<Disclosure.Content>
				Run <code>npm install @ssp/ui</code> and import components from
				<code>@ssp/ui/components/*</code>.
			</Disclosure.Content>
		</Disclosure.Root>
		<Disclosure.Root>
			<Disclosure.Trigger>Does it support dark mode?</Disclosure.Trigger>
			<Disclosure.Content>
				Yes — themes are driven by CSS custom properties and the <code>light-dark()</code>
				function.
			</Disclosure.Content>
		</Disclosure.Root>
		<Disclosure.Root>
			<Disclosure.Trigger>Can I customize components?</Disclosure.Trigger>
			<Disclosure.Content>
				Override the CSS custom properties exposed by each component to restyle them
				without forking the source.
			</Disclosure.Content>
		</Disclosure.Root>
	</div>
</Story>

<Story name="Quiet" asChild>
	<div style="width: 480px;">
		<Disclosure.Root isQuiet>
			<Disclosure.Trigger>No trailing divider</Disclosure.Trigger>
			<Disclosure.Content>
				Useful when the disclosure is embedded in a container that already has its own
				chrome, such as a card.
			</Disclosure.Content>
		</Disclosure.Root>
		<Disclosure.Root isQuiet>
			<Disclosure.Trigger>Another item</Disclosure.Trigger>
			<Disclosure.Content>No dividers between quiet disclosures.</Disclosure.Content>
		</Disclosure.Root>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="display: grid; gap: 16px; width: 560px;">
		{#each ['s', 'm', 'l', 'xl'] as const as size}
			<Disclosure.Root {size}>
				<Disclosure.Trigger>Size {size}</Disclosure.Trigger>
				<Disclosure.Content>Content rendered at size {size}.</Disclosure.Content>
			</Disclosure.Root>
		{/each}
	</div>
</Story>

<Story name="Controlled">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 12px; width: 480px;">
			<div style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);">
				Open: <code>{controlledOpen}</code>
			</div>
			<Disclosure.Root open={controlledOpen} onOpenChange={(o) => (controlledOpen = o)}>
				<Disclosure.Trigger>Controlled disclosure</Disclosure.Trigger>
				<Disclosure.Content>
					Open state is driven by <code>$state</code> in the story.
				</Disclosure.Content>
			</Disclosure.Root>
		</div>
	{/snippet}
</Story>

<Story name="Disabled" asChild>
	<div style="width: 480px;">
		<Disclosure.Root isDisabled>
			<Disclosure.Trigger>Can't be toggled</Disclosure.Trigger>
			<Disclosure.Content>Hidden.</Disclosure.Content>
		</Disclosure.Root>
	</div>
</Story>
