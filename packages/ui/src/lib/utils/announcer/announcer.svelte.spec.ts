import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAnnouncer } from './announcer.js';

function getAnnouncerNode(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-ssp-announcer]');
}

function getLog(kind: 'polite' | 'assertive'): HTMLElement | null {
	return document.querySelector<HTMLElement>(
		`[data-ssp-announcer] [aria-live="${kind}"]`
	);
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

	it('exposes both polite and assertive log regions', () => {
		getAnnouncer(document);
		expect(getLog('polite')).not.toBeNull();
		expect(getLog('assertive')).not.toBeNull();
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

	it('clear() empties a specific kind without scheduling cleanup', () => {
		const a = getAnnouncer(document)!;
		a.announce('one', 'polite');
		a.announce('two', 'polite');
		a.clear('polite');
		expect(getLog('polite')?.textContent ?? '').toBe('');
		expect(getLog('assertive')?.textContent ?? '').toBe('');
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
