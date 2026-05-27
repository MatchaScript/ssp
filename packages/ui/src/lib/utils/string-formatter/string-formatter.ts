export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
export type LocaleEntry = string | Partial<Record<PluralForm, string>>;
export type LocaleStrings = Record<string, LocaleEntry>;

export interface StringFormatter {
	format(key: string, variables?: Record<string, string | number>): string;
}

const FALLBACK_LOCALE = 'en-US';

function interpolate(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (_, name) =>
		Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
	);
}

function resolveEntry(
	entry: LocaleEntry | undefined,
	locale: string,
	vars: Record<string, string | number>
): string | undefined {
	if (entry == null) return undefined;
	if (typeof entry === 'string') return interpolate(entry, vars);
	const count = typeof vars.count === 'number' ? vars.count : undefined;
	const category =
		count !== undefined ? (new Intl.PluralRules(locale).select(count) as PluralForm) : 'other';
	const template = entry[category] ?? entry.other;
	return template !== undefined ? interpolate(template, vars) : undefined;
}

export function createStringFormatter(
	catalogue: Record<string, LocaleStrings>,
	locale: string
): StringFormatter {
	return {
		format(key, variables = {}) {
			const requested = catalogue[locale];
			const fallback = catalogue[FALLBACK_LOCALE];
			const result =
				resolveEntry(requested?.[key], locale, variables) ??
				resolveEntry(fallback?.[key], FALLBACK_LOCALE, variables);
			if (result === undefined) {
				if (process.env.NODE_ENV !== 'production') {
					console.warn(`[ssp-ui] missing i18n key: ${key}`);
				}
				return key;
			}
			return result;
		}
	};
}

export function resolveDocumentLocale(): string {
	if (typeof document === 'undefined') return FALLBACK_LOCALE;
	const lang = document.documentElement.lang?.trim();
	return lang || FALLBACK_LOCALE;
}
