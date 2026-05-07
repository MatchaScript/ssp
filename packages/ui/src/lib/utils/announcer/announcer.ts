export type Assertiveness = 'assertive' | 'polite';

export interface Announcer {
	announce(message: string, kind?: Assertiveness, timeout?: number): void;
	clear(kind?: Assertiveness): void;
}

const SR_ONLY_STYLE =
	'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
const ROOT_ATTR = 'data-ssp-announcer';
const DEFAULT_TIMEOUT_MS = 7000;

function ensureRoot(doc: Document): HTMLElement {
	let root = doc.querySelector<HTMLElement>(`[${ROOT_ATTR}]`);
	if (root) return root;

	root = doc.createElement('div');
	root.setAttribute(ROOT_ATTR, '');
	root.style.cssText = SR_ONLY_STYLE;
	root.appendChild(makeLog(doc, 'polite'));
	root.appendChild(makeLog(doc, 'assertive'));
	doc.body.insertBefore(root, doc.body.firstChild);
	return root;
}

function makeLog(doc: Document, kind: Assertiveness): HTMLElement {
	const log = doc.createElement('div');
	log.setAttribute('role', 'log');
	log.setAttribute('aria-live', kind);
	log.setAttribute('aria-relevant', 'additions');
	return log;
}

function getLog(root: HTMLElement, kind: Assertiveness): HTMLElement | null {
	return root.querySelector<HTMLElement>(`[aria-live="${kind}"]`);
}

/**
 * Returns an announcer bound to the given document, or `null` when no document
 * is available (SSR / test stubs). The DOM node is the singleton — there is no
 * module-scope JS state, which makes this HMR-safe and multi-document-safe.
 */
export function getAnnouncer(docOrNull: Document | null | undefined): Announcer | null {
	if (!docOrNull || typeof window === 'undefined') return null;
	const doc: Document = docOrNull;
	const root = ensureRoot(doc);

	function announce(
		message: string,
		kind: Assertiveness = 'polite',
		timeout: number = DEFAULT_TIMEOUT_MS
	): void {
		const log = getLog(root, kind);
		if (!log) return;

		const trimmed = message.trim();

		// Empty message: cancel in-flight content, no scheduling.
		if (trimmed === '') {
			log.replaceChildren();
			return;
		}

		const node = doc.createElement('div');
		node.textContent = trimmed;

		if (kind === 'assertive') {
			// Assertive replaces — only the latest matters.
			log.replaceChildren(node);
		} else {
			log.appendChild(node);
		}

		if (timeout > 0) {
			setTimeout(() => {
				node.remove();
			}, timeout);
		}
	}

	function clear(kind?: Assertiveness): void {
		if (kind) {
			getLog(root, kind)?.replaceChildren();
		} else {
			getLog(root, 'polite')?.replaceChildren();
			getLog(root, 'assertive')?.replaceChildren();
		}
	}

	return { announce, clear };
}
