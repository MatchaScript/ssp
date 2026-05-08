import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getElementDirection } from './direction.js';

describe('getElementDirection', () => {
	let host: HTMLElement;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
	});

	afterEach(() => {
		host.remove();
	});

	it('returns "ltr" for null', () => {
		expect(getElementDirection(null)).toBe('ltr');
	});

	it('returns "ltr" by default for an unstyled element', () => {
		expect(getElementDirection(host)).toBe('ltr');
	});

	it('returns "rtl" when dir attribute is rtl on the element', () => {
		host.setAttribute('dir', 'rtl');
		expect(getElementDirection(host)).toBe('rtl');
	});

	it('inherits "rtl" from a parent with dir=rtl', () => {
		host.setAttribute('dir', 'rtl');
		const child = document.createElement('span');
		host.appendChild(child);
		expect(getElementDirection(child)).toBe('rtl');
	});

	it('inherits "ltr" from a parent that overrides rtl back to ltr', () => {
		host.setAttribute('dir', 'rtl');
		const middle = document.createElement('div');
		middle.setAttribute('dir', 'ltr');
		host.appendChild(middle);
		const child = document.createElement('span');
		middle.appendChild(child);
		expect(getElementDirection(child)).toBe('ltr');
	});
});
