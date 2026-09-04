import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SelectableCollection } from './selectable-collection.svelte.js';

/**
 * Range selection is shared by every collection built on this primitive, and
 * the shape it commits differs from a plain toggle: it has to keep selections
 * made outside the range while still giving the range back when it shrinks.
 */
describe('SelectableCollection.extendSelection', () => {
	let host: HTMLDivElement;
	let selected: Set<string>;
	let collection: SelectableCollection;

	/** Registers items "a".."e" as siblings so DOM order is a..e. */
	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		selected = new Set<string>();
		collection = new SelectableCollection({
			selectionMode: 'multiple',
			get selectedKeys() {
				return selected;
			},
			shouldFocusWrap: false,
			onSelectionChange: (keys) => {
				selected = keys;
			}
		});
		for (const value of ['a', 'b', 'c', 'd', 'e']) {
			const el = document.createElement('div');
			el.tabIndex = -1;
			host.appendChild(el);
			collection.registerItem({
				domId: `id-${value}`,
				value,
				el,
				disabled: false,
				textValue: value
			});
		}
	});

	afterEach(() => {
		host.remove();
	});

	it('keeps selections made outside the range', () => {
		collection.toggleSelection('e');
		collection.replaceSelection('a');
		expect([...selected]).toEqual(['a']);

		// Re-select `e` non-contiguously. The anchor moves to `e`, so extending
		// to `c` covers c..e. `a` is outside that range and must survive — before
		// this was fixed, extending rebuilt the set from scratch and dropped it.
		collection.toggleSelection('e');
		collection.extendSelection('c');

		expect([...selected].sort()).toEqual(['a', 'c', 'd', 'e']);
	});

	it('gives back what the range no longer covers when it shrinks', () => {
		collection.replaceSelection('a');
		collection.extendSelection('d');
		expect([...selected].sort()).toEqual(['a', 'b', 'c', 'd']);

		collection.extendSelection('b');

		expect([...selected].sort()).toEqual(['a', 'b']);
	});

	it('skips disabled items inside the range', () => {
		collection.registerItem({
			domId: 'id-c',
			value: 'c',
			el: host.children[2] as HTMLElement,
			disabled: true,
			textValue: 'c'
		});

		collection.replaceSelection('a');
		collection.extendSelection('d');

		expect([...selected].sort()).toEqual(['a', 'b', 'd']);
	});
});

describe('SelectableCollection.handleKeyDown', () => {
	let host: HTMLDivElement;
	let selected: Set<string>;
	let collection: SelectableCollection;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		selected = new Set<string>();
		collection = new SelectableCollection({
			selectionMode: 'multiple',
			get selectedKeys() {
				return selected;
			},
			shouldFocusWrap: false,
			onSelectionChange: (keys) => {
				selected = keys;
			}
		});
		for (const value of ['b1', 'a1', 'a2']) {
			const el = document.createElement('div');
			el.tabIndex = -1;
			host.appendChild(el);
			collection.registerItem({
				domId: `id-${value}`,
				value,
				el,
				disabled: false,
				textValue: value
			});
		}
	});

	afterEach(() => {
		host.remove();
	});

	it('moves highlight via typeahead on bare "a" keypress', () => {
		collection.highlight('id-b1');
		expect(collection.highlightedId).toBe('id-b1');

		collection.handleKeyDown(new KeyboardEvent('keydown', { key: 'a' }));

		expect(collection.highlightedId).toBe('id-a1');
	});

	it('selects all on Ctrl+a keypress in multiple selection mode', () => {
		collection.handleKeyDown(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }));

		expect([...selected].sort()).toEqual(['a1', 'a2', 'b1']);
	});
});
