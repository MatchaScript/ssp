import { describe, it, expect } from 'vitest';
import { createStringFormatter, type LocaleStrings } from './string-formatter.js';

const messages: Record<string, LocaleStrings> = {
	'en-US': {
		sortAscending: 'Sort ascending',
		ascendingSort: 'sorted by column {columnName} in ascending order',
		itemsSelected: {
			one: '1 item selected',
			other: '{count} items selected'
		}
	},
	'ja-JP': {
		sortAscending: '昇順で並び替え',
		ascendingSort: '列 {columnName} を昇順で並び替えました',
		itemsSelected: { other: '{count} 件を選択中' }
	}
};

describe('createStringFormatter', () => {
	it('returns plain string entries verbatim', () => {
		expect(createStringFormatter(messages, 'en-US').format('sortAscending')).toBe(
			'Sort ascending'
		);
	});

	it('interpolates {token} placeholders', () => {
		expect(
			createStringFormatter(messages, 'en-US').format('ascendingSort', { columnName: 'Name' })
		).toBe('sorted by column Name in ascending order');
	});

	it('resolves plurals using Intl.PluralRules', () => {
		const fmt = createStringFormatter(messages, 'en-US');
		expect(fmt.format('itemsSelected', { count: 1 })).toBe('1 item selected');
		expect(fmt.format('itemsSelected', { count: 5 })).toBe('5 items selected');
	});

	it('falls back to en-US when the requested locale is missing a key', () => {
		const partial: Record<string, LocaleStrings> = {
			'en-US': { hello: 'Hello' },
			'fr-FR': {}
		};
		expect(createStringFormatter(partial, 'fr-FR').format('hello')).toBe('Hello');
	});
});
