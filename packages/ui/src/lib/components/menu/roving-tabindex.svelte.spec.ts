import { describe, it, expect, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Harness from './roving-tabindex.svelte.spec-harness.svelte';

/**
 * Characterization tests for the roving tabindex and the highlight, as Menu
 * renders them today. Nothing else in the repo pins this, and the highlight is
 * about to be reworked inside SelectableCollection, so these assert the current
 * observable DOM — the tabindex ATTRIBUTE (a missing attribute and tabindex="-1"
 * are different states), document.activeElement, and the data attributes the
 * component sets itself. Menu items show focus through :focus-visible, which is
 * not asserted here because it is not something the component writes.
 */
describe('<Menu> roving tabindex and highlight (characterization)', () => {
	let host: HTMLDivElement;
	let component: ReturnType<typeof mount>;

	afterEach(() => {
		unmount(component);
		host.remove();
	});

	function render(props: { showThird?: boolean; selectionMode?: 'none' | 'multiple' } = {}) {
		host = document.createElement('div');
		document.body.appendChild(host);
		const state = $state({ showThird: true, selectionMode: 'none' as const, ...props });
		component = mount(Harness, { target: host, props: state });
		flushSync();
		return state;
	}

	const menu = () => host.querySelector('[data-testid="menu"]') as HTMLElement;
	const item = (testid: string) => host.querySelector(`[data-testid="${testid}"]`) as HTMLElement;
	const tabindex = (el: HTMLElement) => el.getAttribute('tabindex');

	/** Keydown is handled on the menu container, so send it from wherever focus is. */
	function press(key: string) {
		const target = (document.activeElement ?? document.body) as HTMLElement;
		target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
		flushSync();
	}

	function hover(el: HTMLElement) {
		el.dispatchEvent(new PointerEvent('pointerenter'));
		flushSync();
	}

	// ── 1. Nothing focused yet ──

	it('gives the container the only tab stop before anything is focused', () => {
		render();

		expect(tabindex(menu())).toBe('0');
		expect(tabindex(item('one'))).toBe('-1');
		expect(tabindex(item('three'))).toBe('-1');
		expect(tabindex(item('four'))).toBe('-1');
		expect(document.activeElement).toBe(document.body);
	});

	it('renders the disabled item with tabindex="-1" on the very first paint', () => {
		render();

		// itemTabIndex() runs while the template is created, which is before the
		// MenuItem registration $effect has told the collection the item exists —
		// so the disabled branch is not taken yet and the attribute is written as
		// -1. Nothing re-runs the attribute effect until `highlightedId` changes,
		// so the item keeps a tabindex it is not supposed to have until the first
		// highlight (see the next test).
		expect(tabindex(item('two'))).toBe('-1');
	});

	it('does not create a highlight when the container itself is focused', () => {
		render();
		menu().focus();
		flushSync();

		expect(document.activeElement).toBe(menu());
		expect(tabindex(menu())).toBe('0');
		expect(tabindex(item('one'))).toBe('-1');
	});

	// ── 2. Highlight on an item ──

	it('moves the tab stop onto the highlighted item and drops the container out', () => {
		render();
		hover(item('one'));

		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(menu())).toBe('-1');
		expect(tabindex(item('one'))).toBe('0');
		expect(tabindex(item('three'))).toBe('-1');
		expect(tabindex(item('four'))).toBe('-1');
	});

	it('leaves the item data attributes untouched when the highlight arrives', () => {
		render({ selectionMode: 'multiple' });
		const one = item('one');
		const before = {
			role: one.getAttribute('role'),
			selected: one.getAttribute('data-selected'),
			checked: one.getAttribute('aria-checked'),
			disabled: one.getAttribute('data-disabled')
		};

		hover(one);

		expect(one.getAttribute('role')).toBe(before.role);
		expect(one.getAttribute('data-selected')).toBe(before.selected);
		expect(one.getAttribute('aria-checked')).toBe(before.checked);
		expect(one.getAttribute('data-disabled')).toBe(before.disabled);
		// The highlight is expressed only through tabindex + DOM focus: the
		// component writes no attribute of its own for it.
		expect(one.hasAttribute('data-highlighted')).toBe(false);
		expect(one.hasAttribute('data-focused')).toBe(false);
		expect(tabindex(one)).toBe('0');
	});

	// ── 3. Keyboard navigation ──

	it('moves the tab stop and document.activeElement together on ArrowDown/ArrowUp', () => {
		render();
		menu().focus();
		flushSync();

		press('ArrowDown');
		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(item('one'))).toBe('0');
		expect(tabindex(menu())).toBe('-1');

		// Skips the disabled item.
		press('ArrowDown');
		expect(document.activeElement).toBe(item('three'));
		expect(tabindex(item('one'))).toBe('-1');
		expect(tabindex(item('three'))).toBe('0');

		press('ArrowUp');
		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(item('one'))).toBe('0');
		expect(tabindex(item('three'))).toBe('-1');
	});

	it('wraps from the first item to the last on ArrowUp', () => {
		render();
		menu().focus();
		flushSync();
		press('ArrowDown');

		press('ArrowUp');

		expect(document.activeElement).toBe(item('four'));
		expect(tabindex(item('four'))).toBe('0');
		expect(tabindex(item('one'))).toBe('-1');
	});

	it('jumps to the first and last enabled item on Home/End', () => {
		render();
		menu().focus();
		flushSync();

		press('End');
		expect(document.activeElement).toBe(item('four'));
		expect(tabindex(item('four'))).toBe('0');

		press('Home');
		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(item('one'))).toBe('0');
		expect(tabindex(item('four'))).toBe('-1');
	});

	it('moves the highlight by typeahead', () => {
		render();
		menu().focus();
		flushSync();

		press('f');

		expect(document.activeElement).toBe(item('four'));
		expect(tabindex(item('four'))).toBe('0');
		expect(tabindex(menu())).toBe('-1');
	});

	// ── 4. Disabled item ──

	it('strips the tabindex attribute off the disabled item once the highlight moves', () => {
		render();
		menu().focus();
		flushSync();

		press('ArrowDown');

		expect(item('two').getAttribute('tabindex')).toBeNull();
		expect(item('two').hasAttribute('tabindex')).toBe(false);
		expect(item('two').getAttribute('data-disabled')).toBe('true');
		expect(item('two').getAttribute('aria-disabled')).toBe('true');
	});

	it('refuses the highlight to a disabled item on hover', () => {
		render();
		hover(item('one'));

		hover(item('two'));

		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(item('one'))).toBe('0');
		expect(item('two').getAttribute('tabindex')).toBeNull();
	});

	// ── 5. Unmounting the highlighted item ──

	it('returns the tab stop to the container when the highlighted item unmounts', () => {
		const props = render();
		menu().focus();
		flushSync();
		press('ArrowDown');
		press('ArrowDown');
		expect(document.activeElement).toBe(item('three'));

		props.showThird = false;
		flushSync();

		expect(item('three')).toBeNull();
		// The unregister closure clears highlightedId, so containerTabIndex flips
		// back to 0 and every surviving enabled item is a -1 again.
		expect(tabindex(menu())).toBe('0');
		expect(tabindex(item('one'))).toBe('-1');
		expect(tabindex(item('four'))).toBe('-1');
		expect(item('two').getAttribute('tabindex')).toBeNull();
		// Focus is not moved anywhere by the collection; the browser drops it to
		// the body when the focused element leaves the document.
		expect(document.activeElement).toBe(document.body);
	});

	it('keeps the highlight when a different item unmounts', () => {
		const props = render();
		menu().focus();
		flushSync();
		press('ArrowDown');
		expect(document.activeElement).toBe(item('one'));

		props.showThird = false;
		flushSync();

		expect(item('three')).toBeNull();
		expect(document.activeElement).toBe(item('one'));
		expect(tabindex(item('one'))).toBe('0');
		expect(tabindex(menu())).toBe('-1');
		expect(tabindex(item('four'))).toBe('-1');
	});
});
