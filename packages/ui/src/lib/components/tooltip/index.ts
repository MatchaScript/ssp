export { default as Root } from './tooltip.svelte';
export { default as Trigger } from './tooltip-trigger.svelte';
export { default as Content } from './tooltip-content.svelte';

import { Tooltip as TooltipPrimitive } from 'bits-ui';
export const Provider = TooltipPrimitive.Provider;

export type {
	TooltipRootProps as RootProps,
	TooltipTriggerProps as TriggerProps,
	TooltipContentProps as ContentProps,
	TooltipPlacement as Placement,
	TooltipVariant as Variant
} from './types.js';
