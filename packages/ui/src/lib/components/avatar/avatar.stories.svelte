<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import * as Avatar from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Avatar',
		component: Avatar.Root,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'number', min: 16, max: 128, step: 4 } },
			isOverBackground: { control: 'boolean' }
		},
		args: {
			size: 32,
			isOverBackground: false
		}
	});
</script>

<Story name="Example">
	{#snippet template(args)}
		<Avatar.Root size={args.size} isOverBackground={args.isOverBackground}>
			<Avatar.Image src="https://i.pravatar.cc/150?u=ada" alt="Ada Lovelace" />
			<Avatar.Fallback>AL</Avatar.Fallback>
		</Avatar.Root>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 12px; align-items: center;">
		{#each [16, 24, 32, 48, 64, 80, 96] as size (size)}
			<Avatar.Root {size}>
				<Avatar.Image src="https://i.pravatar.cc/150?u={size}" alt="User {size}" />
				<Avatar.Fallback>U</Avatar.Fallback>
			</Avatar.Root>
		{/each}
	</div>
</Story>

<Story name="Fallback initials" asChild>
	<div style="display: flex; gap: 12px; align-items: center;">
		<Avatar.Root size={40}>
			<Avatar.Image src="/broken.png" alt="Ada" />
			<Avatar.Fallback>AL</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size={40}>
			<Avatar.Image src="/broken.png" alt="Grace" />
			<Avatar.Fallback>GH</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size={40}>
			<Avatar.Image src="/broken.png" alt="Linus" />
			<Avatar.Fallback>LT</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size={40}>
			<Avatar.Image src="/broken.png" alt="Rich" />
			<Avatar.Fallback>RH</Avatar.Fallback>
		</Avatar.Root>
	</div>
</Story>

<Story name="Stacked group" asChild>
	<div style="display: flex; align-items: center;">
		{#each ['a', 'b', 'c', 'd'] as seed, i (seed)}
			<div style="margin-inline-start: {i === 0 ? 0 : -10}px;">
				<Avatar.Root size={36} isOverBackground>
					<Avatar.Image src="https://i.pravatar.cc/150?u={seed}" alt="User {seed}" />
					<Avatar.Fallback>U{i}</Avatar.Fallback>
				</Avatar.Root>
			</div>
		{/each}
		<div
			style="margin-inline-start: -10px; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 9999px; background: var(--neutral-subtle-background-color-default); outline: 2px solid var(--background-base-color); font-size: var(--text-75);"
		>
			+8
		</div>
	</div>
</Story>

<Story name="Over a color" asChild>
	<div
		style="padding: 24px; border-radius: 8px; background: linear-gradient(135deg, #4a3aff, #9c2bff); display: flex; gap: 12px;"
	>
		<Avatar.Root size={48} isOverBackground>
			<Avatar.Image src="https://i.pravatar.cc/150?u=over1" alt="Over 1" />
			<Avatar.Fallback>O1</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size={48} isOverBackground>
			<Avatar.Image src="https://i.pravatar.cc/150?u=over2" alt="Over 2" />
			<Avatar.Fallback>O2</Avatar.Fallback>
		</Avatar.Root>
		<Avatar.Root size={64} isOverBackground>
			<Avatar.Image src="https://i.pravatar.cc/150?u=over3" alt="Over 3" />
			<Avatar.Fallback>O3</Avatar.Fallback>
		</Avatar.Root>
	</div>
</Story>

<Story name="With status dot" asChild>
	<div style="display: flex; gap: 20px;">
		<div style="position: relative;">
			<Avatar.Root size={48}>
				<Avatar.Image src="https://i.pravatar.cc/150?u=online" alt="Online" />
				<Avatar.Fallback>ON</Avatar.Fallback>
			</Avatar.Root>
			<span
				aria-label="Online"
				style="position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 9999px; background: var(--positive-background-color-default); outline: 2px solid var(--background-base-color);"
			></span>
		</div>
		<div style="position: relative;">
			<Avatar.Root size={48}>
				<Avatar.Image src="https://i.pravatar.cc/150?u=away" alt="Away" />
				<Avatar.Fallback>AW</Avatar.Fallback>
			</Avatar.Root>
			<span
				aria-label="Away"
				style="position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 9999px; background: var(--notice-background-color-default); outline: 2px solid var(--background-base-color);"
			></span>
		</div>
		<div style="position: relative;">
			<Avatar.Root size={48}>
				<Avatar.Image src="https://i.pravatar.cc/150?u=offline" alt="Offline" />
				<Avatar.Fallback>OF</Avatar.Fallback>
			</Avatar.Root>
			<span
				aria-label="Offline"
				style="position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 9999px; background: var(--neutral-subdued-background-color-default); outline: 2px solid var(--background-base-color);"
			></span>
		</div>
	</div>
</Story>

<Story name="In a user row" asChild>
	<div style="display: grid; gap: 8px; width: 320px;">
		{#each [{ name: 'Ada Lovelace', role: 'Owner', seed: 'ada' }, { name: 'Grace Hopper', role: 'Admin', seed: 'grace' }, { name: 'Linus Torvalds', role: 'Member', seed: 'linus' }] as user (user.seed)}
			<div style="display: flex; align-items: center; gap: 12px;">
				<Avatar.Root size={40}>
					<Avatar.Image src="https://i.pravatar.cc/150?u={user.seed}" alt={user.name} />
					<Avatar.Fallback>{user.name[0]}</Avatar.Fallback>
				</Avatar.Root>
				<div style="display: grid;">
					<span>{user.name}</span>
					<span
						style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
					>
						{user.role}
					</span>
				</div>
			</div>
		{/each}
	</div>
</Story>
