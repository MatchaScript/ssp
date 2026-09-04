<script lang="ts">
	import { SideNav, SideNavSection, SideNavItem } from './index.js';
	import { Icon } from '$lib/components/icon';
	import { House } from 'lucide';
	import { Text } from '$lib/components/text';
</script>

<SideNav activeMatcher={() => false}>
	<SideNavSection data-testid="with-icon">
		<SideNavItem href="/a">
			<Icon icon={House} />
			<Text>Label</Text>
			<span data-testid="suffix-with-icon">9</span>
		</SideNavItem>
	</SideNavSection>

	<SideNavSection data-testid="without-icon">
		<SideNavItem href="/b">
			<Text>Label</Text>
			<span data-testid="suffix-without-icon">9</span>
		</SideNavItem>
	</SideNavSection>
</SideNav>
