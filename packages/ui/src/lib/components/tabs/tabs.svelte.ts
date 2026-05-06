import { createContext } from 'svelte';

export interface TabsContextProps {
	readonly density: 'compact' | 'regular';
}

export const [getTabsContext, setTabsContext] = createContext<TabsContextProps>();
