<script lang="ts">
	import { m } from '$lib/paraglide/messages';
</script>

<div class="create-empty">
	<p class="create-empty-text">{m.create_select_color()}</p>
</div>

<style>
	.create-empty {
		display: grid;
		place-items: center;
		height: 100%;
	}

	.create-empty-text {
		font-size: var(--text-100);
		color: var(--neutral-subdued-content-color-default);
		margin: 0;
	}
</style>
