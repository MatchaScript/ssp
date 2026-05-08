import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAnnouncer } from './announcer.js';

function getAnnouncerNode(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-ssp-announcer]');
}

function getLog(kind: 'polite' | 'assertive'): HTMLElement | null {
	return document.querySelector<HTMLElement>(`[data-ssp-announcer] [aria-live="${kind}"]`);
}

describe('announcer', () => {
	beforeEach(() => {
		// Wipe any prior singleton so each test starts clean
		getAnnouncerNode()?.remove();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		getAnnouncerNode()?.remove();
	});

	it('returns null when document is null', () => {
		expect(getAnnouncer(null)).toBeNull();
	});

	it('creates the singleton DOM node on first call', () => {
		expect(getAnnouncerNode()).toBeNull();
		const a = getAnnouncer(document);
		expect(a).not.toBeNull();
		expect(getAnnouncerNode()).not.toBeNull();
	});

	it('does not duplicate the singleton when called twice', () => {
		getAnnouncer(document);
		getAnnouncer(document);
		expect(document.querySelectorAll('[data-ssp-announcer]')).toHaveLength(1);
	});

	it('creates log regions with correct ARIA attributes', () => {
		getAnnouncer(document);
		const polite = getLog('polite');
		const assertive = getLog('assertive');
		expect(polite).not.toBeNull();
		expect(assertive).not.toBeNull();
		expect(polite?.getAttribute('role')).toBe('log');
		expect(assertive?.getAttribute('role')).toBe('log');
		expect(polite?.getAttribute('aria-live')).toBe('polite');
		expect(assertive?.getAttribute('aria-live')).toBe('assertive');
		expect(polite?.getAttribute('aria-relevant')).toBe('additions');
		expect(assertive?.getAttribute('aria-relevant')).toBe('additions');
	});

	it('the announcer root is visually hidden via clip-rect sr-only style', () => {
		getAnnouncer(document);
		const root = getAnnouncerNode();
		const cssText = root?.style.cssText ?? '';
		expect(cssText).toContain('position: absolute');
		expect(cssText).toContain('width: 1px');
		expect(cssText).toContain('clip: rect(0, 0, 0, 0)');
	});

	it('appends polite messages to the polite log', () => {
		const a = getAnnouncer(document)!;
		a.announce('hello', 'polite');
		expect(getLog('polite')?.textContent).toContain('hello');
		expect(getLog('assertive')?.textContent ?? '').not.toContain('hello');
	});

	it('replaces assertive messages so only the latest is read', () => {
		const a = getAnnouncer(document)!;
		a.announce('first', 'assertive');
		a.announce('second', 'assertive');
		expect(getLog('assertive')?.textContent).toBe('second');
	});

	it('removes a message after the timeout', () => {
		const a = getAnnouncer(document)!;
		a.announce('temp', 'polite', 1000);
		expect(getLog('polite')?.textContent).toContain('temp');
		vi.advanceTimersByTime(1001);
		expect(getLog('polite')?.textContent ?? '').not.toContain('temp');
	});

	it('clear() empties a specific kind without affecting the other', () => {
		const a = getAnnouncer(document)!;
		a.announce('polite-one', 'polite');
		a.announce('polite-two', 'polite');
		a.announce('assertive-msg', 'assertive');
		a.clear('polite');
		expect(getLog('polite')?.textContent ?? '').toBe('');
		expect(getLog('assertive')?.textContent ?? '').toBe('assertive-msg');
	});

	it('clear() with no argument empties both', () => {
		const a = getAnnouncer(document)!;
		a.announce('p', 'polite');
		a.announce('a', 'assertive');
		a.clear();
		expect(getLog('polite')?.textContent ?? '').toBe('');
		expect(getLog('assertive')?.textContent ?? '').toBe('');
	});
});
