import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'neutral' | 'informative' | 'negative';

export interface TooltipRootProps {
	/**
	 * Tooltip placement relative to the trigger.
	 * @default 'top'
	 */
	placement?: TooltipPlacement;
	/**
	 * Semantic variant.
	 * - `neutral` — most common, no icon
	 * - `informative` — blue, icon required for a11y
	 * - `negative` — red, icon required for a11y
	 * @default 'neutral'
	 */
	variant?: TooltipVariant;
	/**
	 * Show predefined icon (only for informative/negative variants).
	 * @default false
	 */
	hasIcon?: boolean;
	/**
	 * Maximum width in pixels before text wraps.
	 * @default 160
	 */
	maxWidth?: number;
	/**
	 * Whether the tooltip flips to the opposite side when constrained.
	 * @default true
	 */
	shouldFlip?: boolean;
	/**
	 * Distance in pixels between the tip and the trigger.
	 * @default 4
	 */
	offset?: number;
	/**
	 * Delay in milliseconds before the tooltip appears.
	 * @default 700
	 */
	delayDuration?: number;
	/**
	 * Whether the tooltip is open (controlled).
	 */
	open?: boolean;
	/**
	 * Whether the tooltip content can be hovered without closing.
	 * @default false
	 */
	disableHoverableContent?: boolean;
	children: Snippet;
}

export interface TooltipTriggerProps {
	/**
	 * Render function that receives merged a11y/event props to spread
	 * onto the actual trigger element. Required so that `aria-describedby`,
	 * keyboard, and pointer handlers land on the focusable element.
	 *
	 * ```svelte
	 * <Tooltip.Trigger>
	 *   {#snippet child({ props })}
	 *     <Button {...props}>Hover me</Button>
	 *   {/snippet}
	 * </Tooltip.Trigger>
	 * ```
	 */
	child: Snippet<[{ props: Record<string, unknown> }]>;
}

export interface TooltipContentProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
	/** Text content of the tooltip. */
	label: string;
	class?: string;
	style?: string;
}
