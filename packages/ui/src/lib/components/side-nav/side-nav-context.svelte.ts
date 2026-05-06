import { createContext } from 'svelte';

export interface SideNavContextProps {
	readonly closeNav: () => void;
}

export const [getSideNavContext, setSideNavContext] = createContext<SideNavContextProps>();
