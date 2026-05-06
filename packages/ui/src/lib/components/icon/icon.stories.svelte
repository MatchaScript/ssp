<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Icon from './icon.svelte';
	import {
		AlertCircle,
		AlertTriangle,
		Bookmark,
		Check,
		CheckCircle,
		ChevronRight,
		Copy,
		Cpu,
		Database,
		Download,
		Edit,
		ExternalLink,
		FolderOpen,
		Globe,
		HardDrive,
		Home,
		Layers,
		LayoutDashboard,
		LogOut,
		Palette,
		Menu,
		Minus,
		Network,
		Pin,
		Plus,
		Save,
		Search,
		Server,
		Settings,
		Star,
		Sun,
		Trash2,
		X,
		XCircle,
		Zap
	} from './index.js';

	const { Story } = defineMeta({
		title: 'Components/Icon',
		component: Icon,
		tags: ['autodocs'],
		argTypes: {
			size: { control: { type: 'inline-radio' }, options: ['xs', 's', 'm', 'l', 'xl'] },
			color: {
				control: { type: 'select' },
				options: ['default', 'negative', 'positive', 'notice', 'informative', 'accent', 'gray']
			},
			bold: { control: 'boolean' }
		},
		args: {
			size: 'm',
			color: 'default',
			bold: false
		}
	});

	const GALLERY = [
		['Home', Home],
		['Search', Search],
		['Settings', Settings],
		['Plus', Plus],
		['Minus', Minus],
		['Check', Check],
		['X', X],
		['Save', Save],
		['Copy', Copy],
		['Edit', Edit],
		['Trash2', Trash2],
		['Download', Download],
		['ExternalLink', ExternalLink],
		['Bookmark', Bookmark],
		['Pin', Pin],
		['Star', Star],
		['Menu', Menu],
		['ChevronRight', ChevronRight],
		['FolderOpen', FolderOpen],
		['Database', Database],
		['Server', Server],
		['HardDrive', HardDrive],
		['Cpu', Cpu],
		['Network', Network],
		['Globe', Globe],
		['Layers', Layers],
		['LayoutDashboard', LayoutDashboard],
		['LogOut', LogOut],
		['Palette', Palette],
		['Zap', Zap],
		['Sun', Sun],
		['AlertCircle', AlertCircle],
		['AlertTriangle', AlertTriangle],
		['CheckCircle', CheckCircle],
		['XCircle', XCircle]
	] as const;
</script>

<Story name="Example">
	{#snippet template(args)}
		<Icon icon={Search} size={args.size} color={args.color} bold={args.bold} />
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size (size)}
			<div style="display: grid; place-items: center; gap: 4px;">
				<Icon icon={Search} {size} />
				<span
					style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
				>
					{size}
				</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Semantic colors" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		{#each ['default', 'accent', 'informative', 'positive', 'notice', 'negative', 'gray'] as const as color (color)}
			<div style="display: grid; place-items: center; gap: 4px;">
				<Icon icon={AlertCircle} size="l" {color} />
				<span
					style="font-size: var(--text-75); color: var(--neutral-subdued-content-color-default);"
				>
					{color}
				</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Bold (stroke-width 3)" asChild>
	<div style="display: flex; gap: 24px; align-items: center;">
		{#each ['xs', 's', 'm', 'l', 'xl'] as const as size (size)}
			<div style="display: flex; gap: 6px; align-items: center;">
				<Icon icon={Plus} {size} />
				<Icon icon={Plus} {size} bold />
			</div>
		{/each}
	</div>
</Story>

<Story name="Gallery" asChild>
	<div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px; width: 720px;">
		{#each GALLERY as [name, icon] (name)}
			<div
				style="display: grid; place-items: center; gap: 4px; padding: 12px 4px; border: 1px solid var(--neutral-border-color-default); border-radius: 6px;"
			>
				<Icon {icon} size="m" />
				<span
					style="font-size: 10px; color: var(--neutral-subdued-content-color-default); text-align: center;"
				>
					{name}
				</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="With accessible label" asChild>
	<div style="display: flex; gap: 16px; align-items: center;">
		<Icon icon={AlertTriangle} size="l" color="notice" aria-label="Warning" />
		<span>Accessible name is set via <code>aria-label</code>.</span>
	</div>
</Story>
