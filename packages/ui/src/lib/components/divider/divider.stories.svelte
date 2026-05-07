<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Divider } from './index.js';
	import ActionButton from '$lib/components/action-button/action-button.svelte';
	import {
		Icon,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Copy,
		Trash2,
		Edit
	} from '$lib/components/icon';

	const { Story } = defineMeta({
		title: 'Components/Divider',
		component: Divider,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l'] },
			orientation: {
				control: { type: 'inline-radio' },
				options: ['horizontal', 'vertical']
			},
			staticColor: {
				control: { type: 'inline-radio' },
				options: [undefined, 'black', 'white']
			}
		},
		args: {
			size: 'm',
			orientation: 'horizontal'
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="width: 320px;">
			<Divider {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Sizes (horizontal)" asChild>
	<div style="display: grid; gap: 24px; width: 360px;">
		<div>
			<p
				style="margin: 0 0 8px; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Small
			</p>
			<Divider size="s" />
		</div>
		<div>
			<p
				style="margin: 0 0 8px; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Medium (default)
			</p>
			<Divider size="m" />
		</div>
		<div>
			<p
				style="margin: 0 0 8px; font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
			>
				Large
			</p>
			<Divider size="l" />
		</div>
	</div>
</Story>

<Story name="Vertical" asChild>
	<div style="display: flex; align-items: stretch; gap: 16px; height: 80px;">
		<div style="display: grid; place-items: center; padding: 0 16px;">Left</div>
		<Divider orientation="vertical" size="s" />
		<div style="display: grid; place-items: center; padding: 0 16px;">Middle</div>
		<Divider orientation="vertical" size="m" />
		<div style="display: grid; place-items: center; padding: 0 16px;">Right</div>
	</div>
</Story>

<Story name="In a toolbar" asChild>
	<div
		style="display: flex; align-items: center; gap: 4px; padding: 4px; border: 1px solid var(--neutral-border-color-default); border-radius: 6px; width: fit-content;"
	>
		<ActionButton isQuiet size="s" aria-label="Align left">
			<Icon icon={AlignLeft} />
		</ActionButton>
		<ActionButton isQuiet size="s" aria-label="Align center">
			<Icon icon={AlignCenter} />
		</ActionButton>
		<ActionButton isQuiet size="s" aria-label="Align right">
			<Icon icon={AlignRight} />
		</ActionButton>
		<Divider orientation="vertical" size="s" style="margin: 4px 4px; height: 20px;" />
		<ActionButton isQuiet size="s" aria-label="Copy">
			<Icon icon={Copy} />
		</ActionButton>
		<ActionButton isQuiet size="s" aria-label="Edit">
			<Icon icon={Edit} />
		</ActionButton>
		<Divider orientation="vertical" size="s" style="margin: 4px 4px; height: 20px;" />
		<ActionButton isQuiet size="s" aria-label="Delete">
			<Icon icon={Trash2} />
		</ActionButton>
	</div>
</Story>

<Story name="Between sections" asChild>
	<div style="display: grid; gap: 16px; width: 420px;">
		<div>
			<h4 style="margin: 0 0 4px;">Account</h4>
			<p style="margin: 0; color: var(--neutral-subdued-content-color-default);">
				Profile, email, time zone.
			</p>
		</div>
		<Divider size="s" />
		<div>
			<h4 style="margin: 0 0 4px;">Notifications</h4>
			<p style="margin: 0; color: var(--neutral-subdued-content-color-default);">
				In-app, email frequency.
			</p>
		</div>
		<Divider size="s" />
		<div>
			<h4 style="margin: 0 0 4px;">Billing</h4>
			<p style="margin: 0; color: var(--neutral-subdued-content-color-default);">
				Plan, invoices, payment.
			</p>
		</div>
	</div>
</Story>

<Story name="Static color on image" asChild>
	<div
		style="padding: 24px; border-radius: 8px; background: linear-gradient(135deg, #4a3aff, #9c2bff);"
	>
		<div style="display: grid; gap: 16px; width: 320px; color: white;">
			<div>Light-on-dark divider</div>
			<Divider staticColor="white" size="s" />
			<div>Used on colored backgrounds</div>
			<Divider staticColor="white" size="m" />
			<div>Large for emphasis</div>
			<Divider staticColor="white" size="l" />
		</div>
	</div>
</Story>

<Story name="Static color on white" asChild>
	<div style="padding: 24px; border-radius: 8px; background: #fff;">
		<div style="display: grid; gap: 16px; width: 320px; color: #111;">
			<div>Dark-on-light divider</div>
			<Divider staticColor="black" size="s" />
			<div>On fully-white surfaces</div>
			<Divider staticColor="black" size="m" />
			<div>Large for emphasis</div>
			<Divider staticColor="black" size="l" />
		</div>
	</div>
</Story>
