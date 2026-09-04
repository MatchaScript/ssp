<script lang="ts">
	import { Button } from '$lib/components/button/index.js';
	import { Badge } from '$lib/components/badge/index.js';
	import { StatusLight } from '$lib/components/status-light/index.js';
	import { SearchField } from '$lib/components/search-field/index.js';
	import { Text } from '$lib/components/text/index.js';
	import { Divider } from '$lib/components/divider/index.js';

	interface ComponentItem {
		name: string;
		category: string;
		description: string;
		importPath: string;
		status: 'stable' | 'new';
	}

	const components: ComponentItem[] = [
		// Buttons & Action
		{
			name: 'Button',
			category: 'Buttons & Action',
			description: 'Action trigger supporting multiple variants, treatments, and sizes.',
			importPath: '@matchalatte/ssp-ui/components/button',
			status: 'stable'
		},
		{
			name: 'ActionButton',
			category: 'Buttons & Action',
			description: 'Compact button for toolbar actions and icon controls.',
			importPath: '@matchalatte/ssp-ui/components/action-button',
			status: 'stable'
		},
		{
			name: 'ActionButtonGroup',
			category: 'Buttons & Action',
			description: 'Grouped container for organizing related action buttons.',
			importPath: '@matchalatte/ssp-ui/components/action-button-group',
			status: 'stable'
		},
		{
			name: 'ClearButton',
			category: 'Buttons & Action',
			description: 'Dismiss button used to clear input values.',
			importPath: '@matchalatte/ssp-ui/components/clear-button',
			status: 'stable'
		},
		{
			name: 'ToggleButton',
			category: 'Buttons & Action',
			description: 'Interactive button with explicit pressed state.',
			importPath: '@matchalatte/ssp-ui/components/toggle-button',
			status: 'stable'
		},
		{
			name: 'ToggleGroup',
			category: 'Buttons & Action',
			description: 'Grouped toggle buttons supporting single or multiple selection.',
			importPath: '@matchalatte/ssp-ui/components/toggle-group',
			status: 'stable'
		},

		// Inputs & Controls
		{
			name: 'Checkbox',
			category: 'Inputs & Controls',
			description: 'Binary selection control with indeterminate state support.',
			importPath: '@matchalatte/ssp-ui/components/checkbox',
			status: 'stable'
		},
		{
			name: 'ColorPicker',
			category: 'Inputs & Controls',
			description: 'Color selection input with swatch preview and format parsing.',
			importPath: '@matchalatte/ssp-ui/components/color-picker',
			status: 'stable'
		},
		{
			name: 'Combobox',
			category: 'Inputs & Controls',
			description: 'Combobox text input with filterable dropdown list.',
			importPath: '@matchalatte/ssp-ui/components/combobox',
			status: 'stable'
		},
		{
			name: 'DateField',
			category: 'Inputs & Controls',
			description: 'Segmented date input field with localization support.',
			importPath: '@matchalatte/ssp-ui/components/date-field',
			status: 'stable'
		},
		{
			name: 'NumberField',
			category: 'Inputs & Controls',
			description: 'Numeric input field with stepper increment buttons.',
			importPath: '@matchalatte/ssp-ui/components/number-field',
			status: 'stable'
		},
		{
			name: 'Picker',
			category: 'Inputs & Controls',
			description: 'Select picker dropdown menu for option selection.',
			importPath: '@matchalatte/ssp-ui/components/picker',
			status: 'stable'
		},
		{
			name: 'RadioGroup',
			category: 'Inputs & Controls',
			description: 'Radio option group for mutually exclusive options.',
			importPath: '@matchalatte/ssp-ui/components/radio-group',
			status: 'stable'
		},
		{
			name: 'RangeSlider',
			category: 'Inputs & Controls',
			description: 'Dual-thumb slider for selecting numeric range intervals.',
			importPath: '@matchalatte/ssp-ui/components/range-slider',
			status: 'stable'
		},
		{
			name: 'SearchField',
			category: 'Inputs & Controls',
			description: 'Search text input with clear button and search icon.',
			importPath: '@matchalatte/ssp-ui/components/search-field',
			status: 'stable'
		},
		{
			name: 'SegmentedControl',
			category: 'Inputs & Controls',
			description: 'Segmented button bar for switching views or options.',
			importPath: '@matchalatte/ssp-ui/components/segmented-control',
			status: 'stable'
		},
		{
			name: 'SelectBox',
			category: 'Inputs & Controls',
			description: 'Selection box cards with radio or check style.',
			importPath: '@matchalatte/ssp-ui/components/select-box',
			status: 'stable'
		},
		{
			name: 'Slider',
			category: 'Inputs & Controls',
			description: 'Single-thumb value selection slider control.',
			importPath: '@matchalatte/ssp-ui/components/slider',
			status: 'stable'
		},
		{
			name: 'Switch',
			category: 'Inputs & Controls',
			description: 'Toggle switch input for binary settings.',
			importPath: '@matchalatte/ssp-ui/components/switch',
			status: 'stable'
		},
		{
			name: 'Textarea',
			category: 'Inputs & Controls',
			description: 'Multi-line text input field with auto-resizing.',
			importPath: '@matchalatte/ssp-ui/components/textarea',
			status: 'stable'
		},
		{
			name: 'Textfield',
			category: 'Inputs & Controls',
			description: 'Single-line text input field with validation state.',
			importPath: '@matchalatte/ssp-ui/components/textfield',
			status: 'stable'
		},
		{
			name: 'TimeField',
			category: 'Inputs & Controls',
			description: 'Segmented time input field.',
			importPath: '@matchalatte/ssp-ui/components/time-field',
			status: 'stable'
		},

		// Navigation
		{
			name: 'Accordion',
			category: 'Navigation',
			description: 'Collapsible accordion sections for organizing content.',
			importPath: '@matchalatte/ssp-ui/components/accordion',
			status: 'stable'
		},
		{
			name: 'Disclosure',
			category: 'Navigation',
			description: 'Show and hide disclosure container.',
			importPath: '@matchalatte/ssp-ui/components/disclosure',
			status: 'stable'
		},
		{
			name: 'Menu',
			category: 'Navigation',
			description: 'Popup menu for actions, options, and submenus.',
			importPath: '@matchalatte/ssp-ui/components/menu',
			status: 'stable'
		},
		{
			name: 'SideNav',
			category: 'Navigation',
			description: 'Vertical navigation sidebar list with nesting.',
			importPath: '@matchalatte/ssp-ui/components/side-nav',
			status: 'stable'
		},
		{
			name: 'Tabs',
			category: 'Navigation',
			description: 'Tabbed section navigation control.',
			importPath: '@matchalatte/ssp-ui/components/tabs',
			status: 'stable'
		},

		// Status & Feedback
		{
			name: 'Badge',
			category: 'Status & Feedback',
			description: 'Small visual badge for label status and counts.',
			importPath: '@matchalatte/ssp-ui/components/badge',
			status: 'stable'
		},
		{
			name: 'Meter',
			category: 'Status & Feedback',
			description: 'Visual capacity meter displaying a value within a range.',
			importPath: '@matchalatte/ssp-ui/components/meter',
			status: 'stable'
		},
		{
			name: 'ProgressBar',
			category: 'Status & Feedback',
			description: 'Linear task progress bar indicator.',
			importPath: '@matchalatte/ssp-ui/components/progress-bar',
			status: 'stable'
		},
		{
			name: 'ProgressCircle',
			category: 'Status & Feedback',
			description: 'Circular loading spinner and progress indicator.',
			importPath: '@matchalatte/ssp-ui/components/progress-circle',
			status: 'stable'
		},
		{
			name: 'StatusLight',
			category: 'Status & Feedback',
			description: 'Semantic status dot light indicator.',
			importPath: '@matchalatte/ssp-ui/components/status-light',
			status: 'stable'
		},

		// Collections & Data
		{
			name: 'ListView',
			category: 'Collections & Data',
			description: 'Interactive list view supporting selection and keyboard navigation.',
			importPath: '@matchalatte/ssp-ui/components/list-view',
			status: 'stable'
		},
		{
			name: 'TableView',
			category: 'Collections & Data',
			description: 'Tabular data grid view with column sorting and selection.',
			importPath: '@matchalatte/ssp-ui/components/table-view',
			status: 'stable'
		},
		{
			name: 'TagGroup',
			category: 'Collections & Data',
			description: 'Interactive tag collection with removal buttons.',
			importPath: '@matchalatte/ssp-ui/components/tag-group',
			status: 'stable'
		},

		// Overlays & Dialogs
		{
			name: 'ActionBar',
			category: 'Overlays & Dialogs',
			description: 'Floating action bar for batch selection actions.',
			importPath: '@matchalatte/ssp-ui/components/action-bar',
			status: 'stable'
		},
		{
			name: 'Dialog',
			category: 'Overlays & Dialogs',
			description: 'Accessible modal dialog container.',
			importPath: '@matchalatte/ssp-ui/components/dialog',
			status: 'stable'
		},
		{
			name: 'Tooltip',
			category: 'Overlays & Dialogs',
			description: 'Contextual hover and focus tooltip overlay.',
			importPath: '@matchalatte/ssp-ui/components/tooltip',
			status: 'stable'
		},

		// Content & Structure
		{
			name: 'Avatar',
			category: 'Content & Structure',
			description: 'User or entity profile avatar element.',
			importPath: '@matchalatte/ssp-ui/components/avatar',
			status: 'stable'
		},
		{
			name: 'Card',
			category: 'Content & Structure',
			description: 'Structured content container card with selection support.',
			importPath: '@matchalatte/ssp-ui/components/card',
			status: 'stable'
		},
		{
			name: 'Divider',
			category: 'Content & Structure',
			description: 'Visual content divider line.',
			importPath: '@matchalatte/ssp-ui/components/divider',
			status: 'stable'
		},
		{
			name: 'Field',
			category: 'Content & Structure',
			description: 'Form field wrapper with label and help text.',
			importPath: '@matchalatte/ssp-ui/components/field',
			status: 'stable'
		},
		{
			name: 'Icon',
			category: 'Content & Structure',
			description: 'Lucide icon wrapper supporting Spectrum sizes.',
			importPath: '@matchalatte/ssp-ui/components/icon',
			status: 'stable'
		},
		{
			name: 'Label',
			category: 'Content & Structure',
			description: 'Accessible form label component.',
			importPath: '@matchalatte/ssp-ui/components/label',
			status: 'stable'
		},
		{
			name: 'Text',
			category: 'Content & Structure',
			description: 'Typography text component.',
			importPath: '@matchalatte/ssp-ui/components/text',
			status: 'stable'
		}
	];

	const categories = ['All', ...new Set(components.map((c) => c.category))];

	let searchQuery = $state('');
	let selectedCategory = $state('All');

	let filteredComponents = $derived(
		components.filter((c) => {
			const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
			const matchesSearch =
				searchQuery.trim() === '' ||
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.description.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesCategory && matchesSearch;
		})
	);
</script>

<main class="container">
	<header class="header">
		<div class="header-badge">
			<Badge variant="accent">Spectrum Design System for Svelte 5</Badge>
		</div>
		<h1 class="title">SSP Component Library</h1>
		<p class="subtitle">
			A comprehensive collection of <strong>{components.length}</strong> Spectrum-inspired, accessible
			Svelte 5 UI components.
		</p>
		<div class="header-actions">
			<Button variant="accent" href="https://github.com/MatchaScript/ssp" target="_blank">
				GitHub Repository
			</Button>
			<Button variant="secondary" href="https://spectrum.adobe.com/" target="_blank">
				Adobe Spectrum Docs
			</Button>
		</div>
	</header>

	<section class="stats-section">
		<div class="stat-card">
			<div class="stat-value">{components.length}</div>
			<div class="stat-label">Components</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{categories.length - 1}</div>
			<div class="stat-label">Categories</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">Svelte 5</div>
			<div class="stat-label">Runes & Primitives</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">OKLCH</div>
			<div class="stat-label">Leonardo Palettes</div>
		</div>
	</section>

	<Divider size="s" />

	<section class="controls-section">
		<div class="search-wrapper">
			<SearchField
				label="Filter components"
				value={searchQuery}
				onChange={(val) => (searchQuery = val)}
				onClear={() => (searchQuery = '')}
			/>
		</div>

		<div class="category-pills">
			{#each categories as cat (cat)}
				<button
					type="button"
					class="category-btn"
					class:active={selectedCategory === cat}
					onclick={() => (selectedCategory = cat)}
				>
					{cat}
				</button>
			{/each}
		</div>
	</section>

	<section class="grid-section">
		{#if filteredComponents.length === 0}
			<div class="empty-state">
				<Text slot="title">No components found</Text>
				<p>Try adjusting your search query or selected category filter.</p>
			</div>
		{:else}
			{#each filteredComponents as comp (comp.name)}
				<div class="component-card">
					<div class="card-header">
						<h3 class="comp-name">{comp.name}</h3>
						<StatusLight variant="positive" size="m">{comp.status}</StatusLight>
					</div>
					<div class="comp-category-badge">
						<Badge variant="neutral">{comp.category}</Badge>
					</div>
					<p class="comp-desc">{comp.description}</p>
					<div class="comp-code">
						<code>{comp.importPath}</code>
					</div>
				</div>
			{/each}
		{/if}
	</section>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2.5rem 1.5rem 4rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2.5rem;
	}

	.header-badge {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.title {
		font-size: 2.75rem;
		font-weight: 800;
		margin: 0 0 0.75rem;
		letter-spacing: -0.02em;
		color: var(--ssp-color-gray-900, #111);
	}

	.subtitle {
		font-size: 1.15rem;
		color: var(--ssp-color-gray-700, #555);
		margin: 0 0 1.5rem;
		max-width: 650px;
		margin-left: auto;
		margin-right: auto;
		line-height: 1.5;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		align-items: center;
	}

	.stats-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: #ffffff;
		border: 1px solid var(--ssp-color-gray-300, #e0e0e0);
		border-radius: 8px;
		padding: 1.25rem;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--ssp-color-accent-900, #0265dc);
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--ssp-color-gray-600, #666);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}

	.controls-section {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin: 2rem 0;
	}

	.search-wrapper {
		max-width: 480px;
	}

	.category-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.category-btn {
		background: var(--ssp-color-gray-200, #e8e8e8);
		border: 1px solid transparent;
		color: var(--ssp-color-gray-800, #333);
		padding: 0.4rem 0.85rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.category-btn:hover {
		background: var(--ssp-color-gray-300, #dadada);
	}

	.category-btn.active {
		background: var(--ssp-color-accent-800, #0265dc);
		color: #ffffff;
		border-color: var(--ssp-color-accent-800, #0265dc);
	}

	.grid-section {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.25rem;
	}

	.component-card {
		background: #ffffff;
		border: 1px solid var(--ssp-color-gray-300, #e0e0e0);
		border-radius: 8px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.comp-name {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--ssp-color-gray-900, #111);
	}

	.comp-category-badge {
		margin-top: -0.25rem;
	}

	.comp-desc {
		font-size: 0.925rem;
		color: var(--ssp-color-gray-700, #444);
		margin: 0;
		line-height: 1.45;
		flex-grow: 1;
	}

	.comp-code {
		background: var(--ssp-color-gray-200, #f0f0f0);
		padding: 0.4rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8rem;
		overflow-x: auto;
		color: var(--ssp-color-gray-900, #222);
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem 1rem;
		color: var(--ssp-color-gray-600, #666);
	}
</style>
