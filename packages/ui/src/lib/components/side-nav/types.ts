import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';

export type SideNavActiveMatcher = (href: string, opts: { exact?: boolean }) => boolean;

// ── SideNav (shell) ──────────────────────────────────
export type SideNavProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
	open?: boolean;
	/**
	 * Returns true when the given href should be marked active.
	 * Without this, no item is ever active — keeps the library router-agnostic.
	 */
	activeMatcher?: SideNavActiveMatcher;
	children?: Snippet;
	/** i18n overrides */
	i18n?: {
		closeMenu?: string;
		/** Accessible label for the <nav> landmark. */
		label?: string;
	};
};

// ── SideNavSection ───────────────────────────────────
export type SideNavSectionProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	/** When true, the section takes flex:1 and scrolls overflow */
	grow?: boolean;
	/** Optional heading displayed above the section items (replaces caption variant) */
	heading?: string;
	children?: Snippet;
};

// ── SideNavItem ──────────────────────────────────────
export type SideNavItemProps = Omit<HTMLAnchorAttributes, 'children'> & {
	/** If true, requires exact pathname match for active state */
	exact?: boolean;
	href?: string;
	children?: Snippet;
};
