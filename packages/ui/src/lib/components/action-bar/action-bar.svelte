<script lang="ts">
	import type { ActionBarRootProps } from './types.js';
	import { ActionBarState, setActionBarContext } from './action-bar.svelte.js';
	import ActionButton from '../action-button/action-button.svelte';
	import { Toolbar } from 'bits-ui';
	import { X } from '$lib/components/icon';
	import Icon from '$lib/components/icon/icon.svelte';
	let {
		selectedItemCount,
		onClearSelection,
		isEmphasized = false,
		children,
		label,
		i18n,
		ref = $bindable(null),
		class: className,
		...restProps
	}: ActionBarRootProps = $props();

	let t = $derived({
		actionsLabel: i18n?.actionsLabel ?? 'Actions',
		clearSelection: i18n?.clearSelection ?? 'Clear selection',
		selected: i18n?.selected ?? ((count: number) => `${count} selected`)
	});

	setActionBarContext(
		new ActionBarState({
			get isEmphasized() {
				return isEmphasized;
			}
		})
	);

	let visible = $derived(selectedItemCount > 0);
</script>

{#if visible}
	<Toolbar.Root orientation="horizontal">
		{#snippet child({ props })}
			<div
				{...props}
				{...restProps}
				bind:this={ref}
				class={className}
				data-spectrum-actionbar
				data-emphasized={isEmphasized || undefined}
				role="toolbar"
				aria-label={t.actionsLabel}
			>
				<Toolbar.Button>
					{#snippet child({ props: closeProps })}
						<ActionButton
							{...closeProps}
							isQuiet
							size="s"
							staticColor={isEmphasized ? 'auto' : undefined}
							onclick={onClearSelection}
							aria-label={t.clearSelection}
						>
							{#snippet icon()}
								<Icon icon={X} />
							{/snippet}
						</ActionButton>
					{/snippet}
				</Toolbar.Button>

				<span data-spectrum-actionbar-label>
					{#if label}
						{@render label()}
					{:else}
						{t.selected(selectedItemCount)}
					{/if}
				</span>

				<div data-spectrum-actionbar-actions>
					{@render children?.()}
				</div>
			</div>
		{/snippet}
	</Toolbar.Root>
{/if}

<style>
	[data-spectrum-actionbar] {
		position: absolute;
		bottom: var(--spacing-100);
		left: var(--spacing-100);
		right: var(--spacing-100);
		z-index: 1;

		display: flex;
		align-items: center;
		gap: var(--spacing-300);

		min-width: 176px;
		padding-inline: var(--spacing-100);
		padding-block: var(--spacing-200);
		box-sizing: border-box;

		background-color: var(--background-elevated-color);
		color: var(--neutral-content-color-default);
		outline: 1px solid light-dark(var(--transparent-white-25), var(--gray-200));
		outline-offset: -1px;
		border-radius: var(--corner-radius-large-default);
		box-shadow: var(--drop-shadow-elevated);

		font-family: inherit;

		/* Slide-in animation */
		animation: actionbar-slide-in 200ms ease-out;
	}

	/* Emphasized */
	[data-spectrum-actionbar][data-emphasized] {
		background-color: var(--neutral-background-color-default);
		color: light-dark(white, black);
		outline-color: transparent;
	}

	/* Label */
	[data-spectrum-actionbar-label] {
		font-size: var(--text-100);
		white-space: nowrap;
		user-select: none;
		cursor: default;
	}

	/* Actions container */
	[data-spectrum-actionbar-actions] {
		display: flex;
		align-items: center;
		gap: var(--spacing-100);
		margin-inline-start: auto;
	}

	@keyframes actionbar-slide-in {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
