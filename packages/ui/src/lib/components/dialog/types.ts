import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type DialogSize = 's' | 'm' | 'l';

export interface DialogRootProps {
	children: Snippet;
	/**
	 * Dialog size variant.
	 * @default 'm'
	 */
	size?: DialogSize;
	/**
	 * Shows a close button and allows clicking the backdrop to dismiss.
	 * @default false
	 */
	isDismissible?: boolean;
	/**
	 * Prevents the escape key from closing the dialog.
	 * @default false
	 */
	isKeyboardDismissDisabled?: boolean;
	/**
	 * Controlled open state.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Callback when open state changes.
	 */
	onOpenChange?: (open: boolean) => void;
}

export interface DialogTriggerProps {
	/**
	 * Render function that receives a11y/event props to spread
	 * onto the actual trigger element.
	 */
	child: Snippet<[{ props: Record<string, unknown> }]>;
}

export interface DialogCloseProps {
	/**
	 * Render function that receives close handler props to spread
	 * onto the actual close element.
	 */
	child: Snippet<[{ props: Record<string, unknown> }]>;
}

export interface DialogContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: Snippet;
	class?: string;
	style?: string;
}

export interface DialogHeadingProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	children?: Snippet;
	/**
	 * Heading level for the rendered element.
	 * @default 2
	 */
	level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface DialogHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	children?: Snippet;
}

export interface DialogBodyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: Snippet;
	class?: string;
	style?: string;
}

export interface DialogFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	children?: Snippet;
}

export interface DialogHeroProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: Snippet;
}
