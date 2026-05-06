<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as ActionBar from './index.js';

	const { Story } = defineMeta({
		tags: ['autodocs'],
		title: 'Components/ActionBar',
		component: ActionBar.Root,
		argTypes: {
			selectedItemCount: {
				control: { type: 'number', min: 0, max: 100 }
			},
			isEmphasized: { control: 'boolean' }
		},
		args: {
			selectedItemCount: 3,
			isEmphasized: false
		}
	});
</script>

<script lang="ts">
	import { Icon, Pencil, Trash2, Copy, Download, ExternalLink } from '$lib/components/icon';

	let count = $state(3);
</script>

<Story name="Example">
	{#snippet template(args)}
		<div
			style="position: relative; min-height: 220px; width: 480px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
		>
			<p style="color: var(--neutral-subdued-content-color-default); margin: 0;">
				List container — ActionBar is positioned absolute at the bottom.
			</p>
			<ActionBar.Root
				selectedItemCount={args.selectedItemCount}
				isEmphasized={args.isEmphasized}
				onClearSelection={() => {}}
			>
				<ActionBar.Item onclick={() => {}}>
					{#snippet icon()}<Icon icon={Pencil} size="m" />{/snippet}
					Edit
				</ActionBar.Item>
				<ActionBar.Item onclick={() => {}}>
					{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
					Copy
				</ActionBar.Item>
				<ActionBar.Item onclick={() => {}}>
					{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
					Delete
				</ActionBar.Item>
			</ActionBar.Root>
		</div>
	{/snippet}
</Story>

<Story name="Live selection" asChild>
	<div style="display: flex; flex-direction: column; gap: 12px;">
		<div style="display: flex; gap: 8px; align-items: center;">
			<button type="button" onclick={() => (count = Math.max(0, count - 1))}>-</button>
			<span style="min-width: 64px; text-align: center;">{count} selected</span>
			<button type="button" onclick={() => (count += 1)}>+</button>
			<span
				style="margin-left: 12px; color: var(--neutral-subdued-content-color-default); font-size: var(--text-75);"
			>
				The bar is hidden while count = 0.
			</span>
		</div>
		<div
			style="position: relative; min-height: 200px; width: 480px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
		>
			<ActionBar.Root selectedItemCount={count} onClearSelection={() => (count = 0)}>
				<ActionBar.Item onclick={() => {}}>
					{#snippet icon()}<Icon icon={Pencil} size="m" />{/snippet}
					Edit
				</ActionBar.Item>
				<ActionBar.Item onclick={() => {}}>
					{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
					Delete
				</ActionBar.Item>
			</ActionBar.Root>
		</div>
	</div>
</Story>

<Story name="Emphasized" asChild>
	<div
		style="position: relative; min-height: 220px; width: 480px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
	>
		<ActionBar.Root selectedItemCount={5} isEmphasized onClearSelection={() => {}}>
			<ActionBar.Item onclick={() => {}}>
				{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
				Download
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}}>
				{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
				Delete
			</ActionBar.Item>
		</ActionBar.Root>
	</div>
</Story>

<Story name="Many actions" asChild>
	<div
		style="position: relative; min-height: 220px; width: 560px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
	>
		<ActionBar.Root selectedItemCount={12} onClearSelection={() => {}}>
			<ActionBar.Item onclick={() => {}} aria-label="Edit">
				{#snippet icon()}<Icon icon={Pencil} size="m" />{/snippet}
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}} aria-label="Copy">
				{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}} aria-label="Download">
				{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}} aria-label="Open">
				{#snippet icon()}<Icon icon={ExternalLink} size="m" />{/snippet}
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}} aria-label="Delete">
				{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
			</ActionBar.Item>
		</ActionBar.Root>
	</div>
</Story>

<Story name="Custom label" asChild>
	<div
		style="position: relative; min-height: 220px; width: 480px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
	>
		<ActionBar.Root selectedItemCount={7} onClearSelection={() => {}}>
			{#snippet label()}
				<strong>7 files</strong> ready to archive
			{/snippet}
			<ActionBar.Item onclick={() => {}}>
				{#snippet icon()}<Icon icon={Download} size="m" />{/snippet}
				Archive
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}} disabled>
				{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
				Delete
			</ActionBar.Item>
		</ActionBar.Root>
	</div>
</Story>

<Story name="Japanese i18n" asChild>
	<div
		style="position: relative; min-height: 220px; width: 480px; padding: 16px; border: 1px dashed var(--neutral-subdued-border-color-default); border-radius: 8px;"
	>
		<ActionBar.Root
			selectedItemCount={4}
			onClearSelection={() => {}}
			i18n={{
				actionsLabel: 'アクション',
				clearSelection: '選択を解除',
				selected: (n) => `${n}件選択中`
			}}
		>
			<ActionBar.Item onclick={() => {}}>
				{#snippet icon()}<Icon icon={Copy} size="m" />{/snippet}
				コピー
			</ActionBar.Item>
			<ActionBar.Item onclick={() => {}}>
				{#snippet icon()}<Icon icon={Trash2} size="m" />{/snippet}
				削除
			</ActionBar.Item>
		</ActionBar.Root>
	</div>
</Story>
