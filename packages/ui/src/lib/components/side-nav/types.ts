import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';
import type { IconNode } from '$lib/components/icon';

// ── SideNav (shell) ──────────────────────────────────
export type SideNavProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
	open?: boolean;
	children?: Snippet;
	/** i18n overrides */
	i18n?: {
		closeMenu?: string;
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
	/** Lucide icon node — rendered at size "s" */
	icon?: IconNode;
	/** If true, requires exact pathname match for active state */
	exact?: boolean;
	href?: string;
	children?: Snippet;
};
