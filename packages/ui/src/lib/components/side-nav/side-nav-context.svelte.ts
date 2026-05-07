import { createContext } from 'svelte';

export interface SideNavContextProps {
	readonly closeNav: () => void;
	readonly isActive: (href: string, opts: { exact?: boolean }) => boolean;
}

export const [getSideNavContext, setSideNavContext] = createContext<SideNavContextProps>();
