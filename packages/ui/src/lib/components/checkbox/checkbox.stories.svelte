<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Checkbox from './checkbox.svelte';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/Checkbox',
		component: Checkbox,
		argTypes: {
			size: {
				control: { type: 'inline-radio' },
				options: ['s', 'm', 'l', 'xl']
			},
			isEmphasized: { control: 'boolean' },
			isError: { control: 'boolean' },
			checked: { control: 'boolean' },
			indeterminate: { control: 'boolean' },
			isDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			checked: false,
			indeterminate: false,
			isEmphasized: false,
			isError: false,
			isDisabled: false
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<div style="display: flex; flex-direction: column; align-items: start; gap: 8px;">
			<Checkbox {...args}>Option</Checkbox>
		</div>
	{/snippet}
</Story>

<Story name="Sizes">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; align-items: start; gap: 12px;">
			{#each ['s', 'm', 'l', 'xl'] as const as size (size)}
				<Checkbox {size} checked>Size {size}</Checkbox>
			{/each}
		</div>
	{/snippet}
</Story>

<Story name="States">
	{#snippet template()}
		<div style="display: grid; grid-template-columns: repeat(2, max-content); gap: 12px 24px;">
			<Checkbox>Unchecked</Checkbox>
			<Checkbox checked>Checked</Checkbox>
			<Checkbox indeterminate>Indeterminate</Checkbox>
			<Checkbox checked isEmphasized>Emphasized · checked</Checkbox>
			<Checkbox indeterminate isEmphasized>Emphasized · indeterminate</Checkbox>
			<Checkbox isError>Error · unchecked</Checkbox>
			<Checkbox checked isError>Error · checked</Checkbox>
			<Checkbox isDisabled>Disabled</Checkbox>
			<Checkbox checked isDisabled>Disabled · checked</Checkbox>
		</div>
	{/snippet}
</Story>

<Story name="Long label (alignment)">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px;">
			<p
				style="margin: 0; color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);"
			>
				ボックスはラベル1行目のテキストと整列するべき。複数行になったときに視覚的にずれないか確認する。
			</p>
			<Checkbox>
				Subscribe to product updates, release notes, and occasional design system announcements
				delivered weekly.
			</Checkbox>
			<Checkbox checked isEmphasized>
				I have read and agree to the terms of service, privacy policy, and the updated cookie usage
				notice.
			</Checkbox>
			<Checkbox isError>
				This option requires acceptance before continuing — please review the attached document
				carefully.
			</Checkbox>
		</div>
	{/snippet}
</Story>

<Story name="Group">
	{#snippet template()}
		<div style="display: flex; flex-direction: column; align-items: start; gap: 8px;">
			<Checkbox indeterminate>Select all</Checkbox>
			<div style="display: flex; flex-direction: column; gap: 8px; padding-inline-start: 24px;">
				<Checkbox checked>Item A</Checkbox>
				<Checkbox>Item B</Checkbox>
				<Checkbox checked>Item C</Checkbox>
			</div>
		</div>
	{/snippet}
</Story>
