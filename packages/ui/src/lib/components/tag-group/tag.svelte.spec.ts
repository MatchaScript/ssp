import { describe, it, expect } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import TagGroupTestHarness from './tag.svelte.spec-harness.svelte';

describe('Tag', () => {
	it('renders text children', async () => {
		render(TagGroupTestHarness, { items: [{ id: 'a', label: 'Apple' }] });
		await expect.element(page.getByText('Apple')).toBeInTheDocument();
	});

	it('exposes role=row on the tag', async () => {
		render(TagGroupTestHarness, { items: [{ id: 'a', label: 'Apple' }] });
		await expect.element(page.getByRole('row')).toBeInTheDocument();
	});

	it('does not render aria-selected when selectionMode is none', async () => {
		render(TagGroupTestHarness, { items: [{ id: 'a', label: 'Apple' }] });
		const row = page.getByRole('row').element() as HTMLElement;
		expect(row.hasAttribute('aria-selected')).toBe(false);
	});

	it('renders aria-selected when selectionMode is multiple', async () => {
		render(TagGroupTestHarness, {
			items: [{ id: 'a', label: 'Apple' }],
			selectionMode: 'multiple'
		});
		const row = page.getByRole('row').element() as HTMLElement;
		expect(row.getAttribute('aria-selected')).toBe('false');
	});

	it('renders the X button when onRemove is provided', async () => {
		render(TagGroupTestHarness, {
			items: [{ id: 'a', label: 'Apple' }],
			onRemove: () => {}
		});
		await expect.element(page.getByRole('button', { name: /remove/i })).toBeInTheDocument();
	});

	it('does not render the X button without onRemove', async () => {
		render(TagGroupTestHarness, { items: [{ id: 'a', label: 'Apple' }] });
		const buttons = page.getByRole('button').all();
		expect(buttons.length).toBe(0);
	});

	it('renders a stretched <a> when href is set', async () => {
		render(TagGroupTestHarness, {
			items: [{ id: 'a', label: 'Apple', href: 'https://example.com' }]
		});
		const link = document.querySelector<HTMLAnchorElement>('a[data-tag-link]');
		expect(link).not.toBeNull();
		expect(link?.getAttribute('aria-hidden')).toBe('true');
		expect(link?.getAttribute('tabindex')).toBe('-1');
	});

	it('omits aria-selected on link tags even in selection mode', async () => {
		render(TagGroupTestHarness, {
			items: [{ id: 'a', label: 'Apple', href: 'https://example.com' }],
			selectionMode: 'multiple'
		});
		const row = page.getByRole('row').element() as HTMLElement;
		expect(row.hasAttribute('aria-selected')).toBe(false);
	});
});
