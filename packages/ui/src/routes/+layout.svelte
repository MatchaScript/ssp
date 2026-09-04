<script lang="ts">
	import 'virtual:ssp/theme.css';
	import '../../.storybook/demo.css';

	let { children } = $props();
</script>

<div class="ssp-app-layout" data-theme="light">
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		background-color: var(--ssp-color-gray-100, #f8f8f8);
		color: var(--ssp-color-gray-900, #222);
	}

	.ssp-app-layout {
		min-height: 100vh;
		box-sizing: border-box;
	}
</style>
