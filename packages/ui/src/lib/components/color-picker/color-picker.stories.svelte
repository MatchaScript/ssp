<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { ColorPicker } from './index.js';

	const { Story } = defineMeta({
		title: 'Components/ColorPicker',
		component: ColorPicker,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['s', 'm', 'l', 'xl'] },
			rounding: { control: { type: 'inline-radio' }, options: ['default', 'none', 'full'] },
			isDisabled: { control: 'boolean' }
		},
		args: {
			size: 'm',
			rounding: 'default',
			isDisabled: false
		}
	});
</script>

<script lang="ts">
	let accent = $state('#4a3aff');
	let brand = $state('#ff6b35');
	let bg = $state('#101014');
	let text = $state('#f5f5f7');
</script>

<Story name="Example">
	{#snippet template(args)}
		<ColorPicker
			size={args.size}
			rounding={args.rounding}
			isDisabled={args.isDisabled}
			label="Accent color"
			value="#4a3aff"
		/>
	{/snippet}
</Story>

<Story name="Basic" asChild>
	<ColorPicker label="Brand color" value="#ff6b35" />
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 24px; align-items: center;">
		{#each ['s', 'm', 'l', 'xl'] as const as size}
			<ColorPicker {size} label={size.toUpperCase()} value="#4a3aff" />
		{/each}
	</div>
</Story>

<Story name="Rounding" asChild>
	<div style="display: flex; gap: 24px; align-items: center;">
		<ColorPicker rounding="default" size="l" label="Default" value="#3c7bfa" />
		<ColorPicker rounding="none" size="l" label="None" value="#3c7bfa" />
		<ColorPicker rounding="full" size="l" label="Full" value="#3c7bfa" />
	</div>
</Story>

<Story name="Controlled (theme builder)">
	{#snippet template()}
		<div style="display: grid; gap: 16px; width: 280px;">
			<ColorPicker bind:value={accent} label="Accent" size="l" />
			<ColorPicker bind:value={brand} label="Brand" size="l" />
			<ColorPicker bind:value={bg} label="Background" size="l" rounding="full" />
			<ColorPicker bind:value={text} label="Text" size="l" rounding="full" />
			<div
				style="padding: 16px; border-radius: 8px; background: {bg}; color: {text}; font-family: var(--font-sans);"
			>
				<div style="display: flex; gap: 8px; margin-bottom: 12px;">
					<span style="width: 16px; height: 16px; border-radius: 4px; background: {accent};"></span>
					<span style="width: 16px; height: 16px; border-radius: 4px; background: {brand};"></span>
				</div>
				<p style="margin: 0;">Live preview of your theme.</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Without label" asChild>
	<div style="display: flex; gap: 8px;">
		<ColorPicker value="#ff4a4a" rounding="full" size="l" aria-label="Red" />
		<ColorPicker value="#ffaa33" rounding="full" size="l" aria-label="Orange" />
		<ColorPicker value="#ffd84a" rounding="full" size="l" aria-label="Yellow" />
		<ColorPicker value="#3cd070" rounding="full" size="l" aria-label="Green" />
		<ColorPicker value="#3c7bfa" rounding="full" size="l" aria-label="Blue" />
		<ColorPicker value="#9c2bff" rounding="full" size="l" aria-label="Purple" />
	</div>
</Story>

<Story name="Disabled" asChild>
	<div style="display: flex; gap: 16px;">
		<ColorPicker label="Locked" value="#888888" isDisabled />
		<ColorPicker label="Locked" value="#4a3aff" isDisabled size="l" rounding="full" />
	</div>
</Story>
